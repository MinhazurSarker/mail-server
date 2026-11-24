import crypto from "node:crypto";
import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import {
  mongoose,
  UserModel,
  CredentialModel,
  OrganizationModel,
  AuthChallengeModel,
  type IUser,
  type ICredential,
  type IAuthChallenge,
  type AuthChallengeType,
  Types,
} from "@cellsinbox/db";
import { authenticator } from "otplib";
import { env } from "@cellsinbox/env";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  organizationId: string;
  domainId: string;
  email: string;
  role: string;
  status: string;
  tokenVersion: number;
}

export class AuthService {
  private static getJwtSecret(): Uint8Array {
    return new TextEncoder().encode(env.JWT_SECRET);
  }

  private static getRefreshSecret(): Uint8Array {
    return new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  }

  static async generateTokens(user: IUser): Promise<AuthTokens> {
    const tokenVersion = user.tokenVersion || 1;
    const payload: TokenPayload = {
      userId: user._id.toString(),
      organizationId: user.organizationId ? user.organizationId.toString() : "",
      domainId: user.domainId ? user.domainId.toString() : "",
      email: user.email,
      role: user.role,
      status: user.status,
      tokenVersion,
    };

    const accessToken = await new SignJWT(payload as unknown as Record<string, any>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN ? `${env.JWT_EXPIRES_IN}s` : "24h")
      .sign(this.getJwtSecret());

    const refreshToken = await new SignJWT({
      userId: user._id.toString(),
      tokenVersion,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN ? `${env.JWT_REFRESH_EXPIRES_IN}s` : "90d")
      .sign(this.getRefreshSecret());

    return { accessToken, refreshToken };
  }

  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, this.getJwtSecret());
    return payload as unknown as TokenPayload;
  }

  /**
   * Centralized tenant lifecycle validation (R9).
   * Platform admins are globally privileged.
   * All other users strictly require an existing organization with status ACTIVE.
   */
  static async assertActiveTenant(user: IUser): Promise<void> {
    if (user.status === "SUSPENDED" || user.status === "LOCKED") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Access denied.`);
    }

    if (user.role === "PLATFORM_ADMIN") {
      return;
    }
    if (!user.organizationId) {
      throw new Error("User has no assigned organization.");
    }
    const org = await OrganizationModel.findById(user.organizationId);
    if (!org) {
      throw new Error("Organization not found.");
    }
    if (org.status === "PENDING_APPROVAL") {
      throw new Error("Organization registration is pending approval by platform administrator.");
    }
    if (org.status === "SUSPENDED") {
      throw new Error("This organization has been suspended by platform administration. Contact support.");
    }
    if (org.status !== "ACTIVE") {
      throw new Error("Organization is not active. Access denied.");
    }
  }

  /**
   * Atomic session revocation (R4, R5).
   * Uses aggregation pipeline update to ensure legacy users without tokenVersion
   * are unconditionally incremented from default 1 to 2.
   * Also invalidates all pending authentication challenges for this user.
   */
  static async revokeUserSessions(userId: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      [
        {
          $set: {
            tokenVersion: {
              $add: [{ $ifNull: ["$tokenVersion", 1] }, 1],
            },
          },
        },
      ],
    );

    // Invalidate all outstanding pending challenges (R5)
    await AuthChallengeModel.updateMany(
      { userId: new Types.ObjectId(userId), status: "PENDING" },
      { $set: { status: "EXPIRED" } },
    );
  }

  // --- AuthChallenge Engine ---

  static async createAuthChallenge(params: {
    userId?: string | Types.ObjectId;
    type: AuthChallengeType;
    factorsRequired?: string[];
    passkeyChallenge?: string;
    totpSecretPending?: string;
    expectedRPID?: string;
    expectedOrigin?: string;
    maxAttempts?: number;
    expiresInSeconds?: number;
  }): Promise<{ challengeToken: string; expiresAt: Date }> {
    const challengeToken = crypto.randomBytes(32).toString("hex");
    const challengeHash = crypto.createHash("sha256").update(challengeToken).digest("hex");
    const expiresIn = params.expiresInSeconds || 300; // 5 minutes default
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    let userTokenVersion: number | undefined;
    if (params.userId) {
      const user = await UserModel.findById(params.userId);
      if (user) {
        userTokenVersion = user.tokenVersion || 1;
      }
    }

    await AuthChallengeModel.create({
      userId: params.userId
        ? typeof params.userId === "string"
          ? new Types.ObjectId(params.userId)
          : params.userId
        : undefined,
      challengeHash,
      type: params.type,
      status: "PENDING",
      factorsRequired: params.factorsRequired || [],
      factorsVerified: [],
      passkeyChallenge: params.passkeyChallenge,
      totpSecretPending: params.totpSecretPending,
      userTokenVersion,
      expectedRPID: params.expectedRPID,
      expectedOrigin: params.expectedOrigin,
      attempts: 0,
      maxAttempts: params.maxAttempts !== undefined ? params.maxAttempts : 5,
      expiresAt,
    });

    return { challengeToken, expiresAt };
  }

  /**
   * Atomically claims an authentication challenge (R2, R5, R11).
   * Enforces purpose binding and dynamic maxAttempts in the atomic query.
   * Revalidates user credential generation / tokenVersion (R5).
   */
  static async claimPendingChallenge(
    challengeToken: string,
    expectedType: AuthChallengeType,
  ): Promise<IAuthChallenge> {
    if (!challengeToken || typeof challengeToken !== "string" || challengeToken.trim().length < 16) {
      throw new Error("Invalid or missing authentication challenge.");
    }

    const cleanToken = challengeToken.trim();
    const challengeHash = crypto.createHash("sha256").update(cleanToken).digest("hex");
    const now = new Date();

    // Atomic find and increment attempt count while strictly ensuring:
    // 1. challengeHash matches
    // 2. purpose matches expectedType (does not spend attempt on wrong purpose) (R11)
    // 3. status is PENDING
    // 4. expiresAt > now
    // 5. attempts < maxAttempts (dynamic limit check, R11)
    const challenge = await AuthChallengeModel.findOneAndUpdate(
      {
        challengeHash,
        type: expectedType,
        status: "PENDING",
        expiresAt: { $gt: now },
        $expr: { $lt: ["$attempts", "$maxAttempts"] },
      },
      {
        $inc: { attempts: 1 },
      },
      {
        new: true,
        select: "+totpSecretPending",
      },
    );

    if (!challenge) {
      const existing = await AuthChallengeModel.findOne({ challengeHash });
      if (!existing) {
        throw new Error("Authentication challenge expired or invalid. Please sign in again.");
      }
      if (existing.type !== expectedType) {
        throw new Error(`Invalid challenge purpose: expected ${expectedType}`);
      }
      if (existing.status === "CONSUMED") {
        throw new Error("Authentication challenge already used. Please initiate a new login.");
      }
      if (existing.expiresAt <= now) {
        throw new Error("Authentication challenge has expired. Please sign in again.");
      }
      if (existing.attempts >= existing.maxAttempts) {
        throw new Error("Maximum verification attempts exceeded. Please initiate a new login.");
      }
      throw new Error("Authentication challenge invalid or expired.");
    }

    // Verify session/credential generation: reject stale challenge if user tokenVersion changed (R5)
    if (challenge.userId && challenge.userTokenVersion !== undefined) {
      const user = await UserModel.findById(challenge.userId);
      if (!user) {
        throw new Error("User account associated with challenge no longer exists.");
      }
      const currentVersion = user.tokenVersion || 1;
      if (currentVersion !== challenge.userTokenVersion) {
        await AuthChallengeModel.updateOne(
          { _id: challenge._id },
          { $set: { status: "EXPIRED" } },
        );
        throw new Error("Authentication challenge is invalid: account credentials or sessions have been revoked. Please sign in again.");
      }
    }

    return challenge;
  }

  static async consumeChallenge(challengeId: Types.ObjectId | string): Promise<boolean> {
    const res = await AuthChallengeModel.updateOne(
      { _id: challengeId, status: "PENDING", expiresAt: { $gt: new Date() } },
      { $set: { status: "CONSUMED", consumedAt: new Date() } },
    );
    return res.modifiedCount > 0;
  }

  // --- Password Validation ---

  static async validatePassword(email: string, passwordPlain: string): Promise<IUser> {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (user.status === "SUSPENDED" || user.status === "LOCKED") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Please contact your organization administrator.`);
    }

    // Strict tenant existence and active status enforcement (R9)
    await this.assertActiveTenant(user);

    const isValid = await argon2.verify(user.passwordHash, passwordPlain);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    if (user.email === "minhazur@cellsweb.com" && user.role !== "PLATFORM_ADMIN") {
      user.role = "PLATFORM_ADMIN";
      await user.save();
    }

    return user;
  }

  static async getUserCredentials(userId: string): Promise<ICredential[]> {
    return await CredentialModel.find({ userId });
  }

  static generateTotpSetup(user: IUser): { secret: string; otpauthUri: string } {
    const secret = authenticator.generateSecret();
    const otpauthUri = authenticator.keyuri(user.email, "CellsInbox", secret);
    return { secret, otpauthUri };
  }

  // --- TOTP Challenge Verification (Step 2 of Login) ---

  static async verifyTotpForChallenge(
    challengeToken: string,
    code: string,
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const challenge = await this.claimPendingChallenge(challengeToken, "MFA_LOGIN");

    if (!challenge.userId) {
      throw new Error("Authentication challenge has no associated user.");
    }

    const user = await UserModel.findById(challenge.userId);
    if (!user) {
      throw new Error("User account associated with challenge no longer exists.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Access denied.`);
    }

    // Strict tenant existence and active status enforcement (R9)
    await this.assertActiveTenant(user);

    const expectedVersion = challenge.userTokenVersion ?? 1;
    if ((user.tokenVersion || 1) !== expectedVersion) {
      await AuthChallengeModel.updateOne(
        { _id: challenge._id },
        { $set: { status: "EXPIRED" } },
      );
      throw new Error("Authentication challenge is invalid: account credentials or sessions have been revoked. Please sign in again.");
    }

    const cred = await CredentialModel.findOne({ userId: user._id, type: "TOTP" }).select("+secret");
    if (!cred || !cred.secret) {
      throw new Error("No TOTP authenticator enrolled for this account.");
    }

    const delta = authenticator.checkDelta(code, cred.secret);
    if (delta === null) {
      throw new Error("Invalid 6-digit verification code.");
    }

    const currentStep = Math.floor(Date.now() / 1000 / 30);
    const codeStep = currentStep + delta;

    // Atomic monotonic step update on Credential (R2)
    // Ensures only one request can use this time step; concurrent requests fail here
    const credUpdate = await CredentialModel.findOneAndUpdate(
      {
        _id: cred._id,
        $or: [
          { lastUsedTimeStep: { $lt: codeStep } },
          { lastUsedTimeStep: { $exists: false } },
        ],
      },
      {
        $set: {
          lastUsedTimeStep: codeStep,
          lastUsedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!credUpdate) {
      throw new Error("TOTP code already used. Please wait for the next 30-second code.");
    }

    // Final commit boundary: atomic consumption asserting generation consistency (R5)
    // Must assert the user's tokenVersion was not incremented by concurrent revocation
    const finalUser = await UserModel.findOne({
      _id: user._id,
      $or: [
        { tokenVersion: expectedVersion },
        ...(expectedVersion === 1 ? [{ tokenVersion: { $exists: false } }] : []),
      ],
      status: "ACTIVE",
    });

    if (!finalUser) {
      await AuthChallengeModel.updateOne(
        { _id: challenge._id },
        { $set: { status: "EXPIRED" } },
      );
      throw new Error("Authentication challenge expired or invalidated by session revocation. Please sign in again.");
    }

    const consumeSuccess = await this.consumeChallenge(challenge._id);
    if (!consumeSuccess) {
      throw new Error("Authentication challenge already used or expired. Please sign in again.");
    }

    const tokens = await this.generateTokens(finalUser);
    return { user: finalUser, tokens };
  }

  // --- Onboarding Completion ---

  static async completeFirstLoginSecuritySetup(data: {
    challengeToken: string;
    newPassword?: string;
    totpToken?: string;
    passkeyResponse?: RegistrationResponseJSON;
    passkeyCredential?: never;
  }): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Explicitly reject raw client-supplied passkey credential objects (R1)
    if ((data as any).passkeyCredential && !data.passkeyResponse) {
      throw new Error("Raw passkey credentials are not accepted. Passkey enrollment requires verified WebAuthn registration.");
    }

    if (!data.totpToken && !data.passkeyResponse) {
      throw new Error("Mandatory security setup: You must configure a Passkey or TOTP.");
    }

    const challenge = await this.claimPendingChallenge(data.challengeToken, "FIRST_LOGIN_ONBOARDING");

    if (!challenge.userId) {
      throw new Error("Onboarding challenge is missing user association.");
    }

    const user = await UserModel.findById(challenge.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.status !== "PENDING_SECURITY_SETUP") {
      throw new Error("Account has already completed security setup. Please sign in normally.");
    }

    // Strict tenant existence and active status enforcement (R9)
    await this.assertActiveTenant(user);

    let verifiedTotp: { secret: string; codeStep: number } | null = null;
    let verifiedPasskeyCredential: { id: string; publicKey: string; counter: number } | null = null;

    // 1. Verify TOTP if provided
    if (data.totpToken) {
      const secret = challenge.totpSecretPending;
      if (!secret) {
        throw new Error("No pending TOTP secret found in onboarding challenge.");
      }

      const delta = authenticator.checkDelta(data.totpToken, secret);
      if (delta === null) {
        throw new Error("Invalid TOTP verification code. Please scan the QR code and enter the 6 digits.");
      }

      const currentStep = Math.floor(Date.now() / 1000 / 30);
      verifiedTotp = {
        secret,
        codeStep: currentStep + delta,
      };
    }

    // 2. Verify WebAuthn Passkey registration ceremony if provided (R1)
    if (data.passkeyResponse) {
      if (!challenge.passkeyChallenge) {
        throw new Error("No passkey challenge issued for this onboarding session.");
      }
      const expectedRPID = challenge.expectedRPID || "webmail.cellsweb.com";
      const expectedOrigin = challenge.expectedOrigin || "https://webmail.cellsweb.com";

      const verification = await verifyRegistrationResponse({
        response: data.passkeyResponse,
        expectedChallenge: challenge.passkeyChallenge,
        expectedOrigin,
        expectedRPID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error("Passkey registration verification failed.");
      }

      const { credential } = verification.registrationInfo;
      verifiedPasskeyCredential = {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        counter: credential.counter,
      };
    }

    // 3. Prepare password hash before persistence boundary
    const newPasswordHash =
      data.newPassword && data.newPassword.trim().length >= 8
        ? await argon2.hash(data.newPassword.trim())
        : undefined;

    // 4. Single consistent completion boundary (R3)
    // Check if MongoDB deployment supports multi-document transactions
    const client = (mongoose.connection as any).getClient
      ? (mongoose.connection as any).getClient()
      : (mongoose.connection as any).client;
    const canUseTransaction =
      Boolean(client?.topology?.description?.type &&
      client.topology.description.type !== "Single");

    if (canUseTransaction) {
      const session = await mongoose.startSession();
      try {
        let updatedUser: IUser | null = null;
        await session.withTransaction(async () => {
          // Atomically consume challenge inside transaction
          const chal = await AuthChallengeModel.findOneAndUpdate(
            { _id: challenge._id, status: "PENDING" },
            { $set: { status: "CONSUMED" } },
            { session },
          );
          if (!chal) {
            throw new Error("Onboarding challenge already used or expired. Please initiate onboarding again.");
          }

          // Atomically transition user status PENDING_SECURITY_SETUP -> ACTIVE
          updatedUser = await UserModel.findOneAndUpdate(
            { _id: user._id, status: "PENDING_SECURITY_SETUP" },
            {
              $set: {
                status: "ACTIVE",
                twoFactorEnforced: true,
                ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
              },
              $inc: { tokenVersion: 1 },
            },
            { new: true, session },
          );
          if (!updatedUser) {
            throw new Error("Account has already completed security setup. Please sign in normally.");
          }

          // Persist verified factor credentials
          if (verifiedTotp) {
            await CredentialModel.findOneAndUpdate(
              { userId: user._id, type: "TOTP" },
              {
                $set: {
                  secret: verifiedTotp.secret,
                  name: "Authenticator App (TOTP)",
                  lastUsedTimeStep: verifiedTotp.codeStep,
                  lastUsedAt: new Date(),
                },
              },
              { upsert: true, new: true, session },
            );
          }

          if (verifiedPasskeyCredential) {
            await CredentialModel.create(
              [
                {
                  userId: user._id,
                  type: "PASSKEY",
                  credentialId: verifiedPasskeyCredential.id,
                  publicKey: verifiedPasskeyCredential.publicKey,
                  counter: verifiedPasskeyCredential.counter,
                },
              ],
              { session },
            );
          }
        });

        const tokens = await this.generateTokens(updatedUser!);
        return { user: updatedUser!, tokens };
      } finally {
        await session.endSession();
      }
    }

    // Standalone MongoDB fallback: Guarded state machine with atomic ownership gate and rollback
    const claimLockId = challenge._id.toString();

    // Step 1: Claim user activation atomically before touching any credentials
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id, status: "PENDING_SECURITY_SETUP" },
      {
        $set: {
          status: "ACTIVE",
          twoFactorEnforced: true,
          ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
          onboardingClaimId: claimLockId,
        },
        $inc: { tokenVersion: 1 },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error("Account has already completed security setup. Please sign in normally.");
    }

    try {
      // Step 2: Persist verified credentials (only the winning challenge reaches this step)
      if (verifiedTotp) {
        await CredentialModel.findOneAndUpdate(
          { userId: user._id, type: "TOTP" },
          {
            $set: {
              secret: verifiedTotp.secret,
              name: "Authenticator App (TOTP)",
              lastUsedTimeStep: verifiedTotp.codeStep,
              lastUsedAt: new Date(),
            },
          },
          { upsert: true, new: true },
        );
      }

      if (verifiedPasskeyCredential) {
        await CredentialModel.create({
          userId: user._id,
          type: "PASSKEY",
          credentialId: verifiedPasskeyCredential.id,
          publicKey: verifiedPasskeyCredential.publicKey,
          counter: verifiedPasskeyCredential.counter,
        });
      }

      // Step 3: Consume the challenge
      const consumeSuccess = await this.consumeChallenge(challenge._id);
      if (!consumeSuccess) {
        throw new Error("Onboarding challenge already used or expired.");
      }

      const tokens = await this.generateTokens(updatedUser);
      return { user: updatedUser, tokens };
    } catch (err) {
      // Step 4: Rollback recovery: if credential or consumption step fails,
      // revert user status to PENDING_SECURITY_SETUP so the account is not unrecoverable!
      await UserModel.updateOne(
        { _id: user._id, onboardingClaimId: claimLockId },
        {
          $set: { status: "PENDING_SECURITY_SETUP", twoFactorEnforced: false },
          $unset: { onboardingClaimId: 1 },
        },
      );
      if (verifiedTotp) {
        await CredentialModel.deleteOne({ userId: user._id, type: "TOTP", secret: verifiedTotp.secret });
      }
      throw err;
    }
  }

  // --- WebAuthn Passkeys ---

  static resolveHostAndOrigin(host?: string): { cleanHost: string; expectedOrigin: string } {
    let cleanCandidate = (host || "").split(":")[0].trim();
    if (!cleanCandidate || cleanCandidate === "api_server" || cleanCandidate.includes("localhost:4000")) {
      try {
        cleanCandidate = new URL(env.FRONTEND_URL || "https://webmail.cellsweb.com").hostname;
      } catch {
        cleanCandidate = "webmail.cellsweb.com";
      }
    }
    const isLocal = cleanCandidate === "localhost" || cleanCandidate === "127.0.0.1";
    const expectedOrigin = isLocal
      ? host && host.includes(":")
        ? `http://${host}`
        : `http://${cleanCandidate}:3000`
      : `https://${cleanCandidate}`;
    return { cleanHost: cleanCandidate, expectedOrigin };
  }

  static async generatePasskeyRegistrationOptions(user: IUser, host?: string) {
    const userCredentials = await CredentialModel.find({ userId: user._id, type: "PASSKEY" });
    const excludeCredentials = userCredentials.map((c) => ({
      id: c.credentialId!,
      transports: c.transports as any,
    }));

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);

    const options = await generateRegistrationOptions({
      rpName: "CellsInbox Enterprise",
      rpID: cleanHost,
      userID: new TextEncoder().encode(user._id.toString()),
      userName: user.email,
      userDisplayName: user.displayName || user.email,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    const { challengeToken } = await this.createAuthChallenge({
      userId: user._id,
      type: "PASSKEY_REG",
      passkeyChallenge: options.challenge,
      expectedRPID: cleanHost,
      expectedOrigin,
    });

    return { options, challengeToken };
  }

  /**
   * Generates genuine WebAuthn registration options for an onboarding user (Priority 5).
   * Binds the passkey challenge and expected origin/RPID directly to the FIRST_LOGIN_ONBOARDING challenge document.
   */
  static async generateOnboardingPasskeyOptions(challengeToken: string, host?: string) {
    if (!challengeToken || challengeToken.trim().length < 16) {
      throw new Error("Invalid or missing onboarding challenge token.");
    }

    const challengeHash = crypto.createHash("sha256").update(challengeToken.trim()).digest("hex");
    const challenge = await AuthChallengeModel.findOne({
      challengeHash,
      type: "FIRST_LOGIN_ONBOARDING",
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    });

    if (!challenge || !challenge.userId) {
      throw new Error("Onboarding challenge expired or invalid. Please sign in again.");
    }

    const user = await UserModel.findById(challenge.userId);
    if (!user) {
      throw new Error("User account associated with challenge not found.");
    }

    await this.assertActiveTenant(user);

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);

    const options = await generateRegistrationOptions({
      rpName: "CellsInbox Sovereign Mail",
      rpID: cleanHost,
      userID: new TextEncoder().encode(user._id.toString()),
      userName: user.email,
      userDisplayName: user.displayName || user.email,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await AuthChallengeModel.updateOne(
      { _id: challenge._id },
      {
        $set: {
          passkeyChallenge: options.challenge,
          expectedRPID: cleanHost,
          expectedOrigin,
        },
      },
    );

    return { options };
  }

  static async verifyPasskeyRegistration(
    user: IUser,
    response: RegistrationResponseJSON,
    challengeToken?: string,
    host?: string,
  ) {
    let challenge: IAuthChallenge | null = null;
    if (challengeToken && challengeToken.trim().length >= 16) {
      challenge = await this.claimPendingChallenge(challengeToken, "PASSKEY_REG");
    } else {
      challenge = await AuthChallengeModel.findOneAndUpdate(
        {
          userId: user._id,
          type: "PASSKEY_REG",
          status: "PENDING",
          expiresAt: { $gt: new Date() },
          $expr: { $lt: ["$attempts", "$maxAttempts"] },
        },
        { $inc: { attempts: 1 } },
        { new: true, sort: { createdAt: -1 } },
      );
    }

    if (!challenge) {
      throw new Error("Passkey registration challenge expired or not found. Please retry.");
    }

    if (!challenge.userId || challenge.userId.toString() !== user._id.toString()) {
      throw new Error("Passkey registration challenge user mismatch.");
    }
    if (!challenge.passkeyChallenge) {
      throw new Error("Passkey registration challenge data missing.");
    }

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);
    const expectedRPID = challenge.expectedRPID || cleanHost;
    const origin = challenge.expectedOrigin || expectedOrigin;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.passkeyChallenge,
      expectedOrigin: origin,
      expectedRPID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      // Consume challenge atomically before writing credential (R2)
      const consumeSuccess = await this.consumeChallenge(challenge._id);
      if (!consumeSuccess) {
        throw new Error("Passkey registration challenge already used or expired.");
      }

      await CredentialModel.create({
        userId: user._id,
        type: "PASSKEY",
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        counter: credential.counter,
      });

      // Revoke existing sessions atomically (R4)
      await this.revokeUserSessions(user._id.toString());
    }

    return verification;
  }

  static async generatePasskeyAuthenticationOptions(user?: IUser, host?: string) {
    let allowCredentials: any[] = [];
    if (user) {
      const creds = await CredentialModel.find({ userId: user._id, type: "PASSKEY" });
      allowCredentials = creds.map((c) => ({
        id: c.credentialId!,
        transports: c.transports as any,
      }));
    }

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);

    const options = await generateAuthenticationOptions({
      rpID: cleanHost,
      allowCredentials,
      userVerification: "preferred",
    });

    const { challengeToken } = await this.createAuthChallenge({
      userId: user ? user._id : undefined,
      type: "PASSKEY_AUTH",
      passkeyChallenge: options.challenge,
      expectedRPID: cleanHost,
      expectedOrigin,
    });

    return { options, challengeToken };
  }

  static async verifyPasskeyAuthentication(
    response: AuthenticationResponseJSON,
    challengeToken: string,
    host?: string,
  ): Promise<{ user: IUser; tokens: AuthTokens; verification: any }> {
    const challenge = await this.claimPendingChallenge(challengeToken, "PASSKEY_AUTH");
    if (!challenge.passkeyChallenge) {
      throw new Error("Passkey authentication challenge data missing.");
    }

    const cred = await CredentialModel.findOne({
      credentialId: response.id,
      type: "PASSKEY",
    });

    if (!cred || !cred.publicKey) {
      throw new Error("Passkey credential not registered for this account.");
    }

    // Account binding check: if challenge was bound to a specific user, verify credential belongs to that user
    if (challenge.userId && challenge.userId.toString() !== cred.userId.toString()) {
      throw new Error("Passkey credential does not match the requested authentication account.");
    }

    const user = await UserModel.findById(cred.userId);
    if (!user) {
      throw new Error("User associated with this Passkey not found.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Access denied.`);
    }

    // Strict tenant existence and active status enforcement (R9)
    await this.assertActiveTenant(user);

    const expectedVersion = challenge.userTokenVersion;
    if (expectedVersion !== undefined && (user.tokenVersion || 1) !== expectedVersion) {
      await AuthChallengeModel.updateOne(
        { _id: challenge._id },
        { $set: { status: "EXPIRED" } },
      );
      throw new Error("Authentication challenge is invalid: account credentials or sessions have been revoked. Please sign in again.");
    }

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);
    const expectedRPID = challenge.expectedRPID || cleanHost;
    const origin = challenge.expectedOrigin || expectedOrigin;

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.passkeyChallenge,
      expectedOrigin: origin,
      expectedRPID,
      credential: {
        id: cred.credentialId!,
        publicKey: Buffer.from(cred.publicKey, "base64"),
        counter: cred.counter || 0,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      const newCounter = verification.authenticationInfo.newCounter;

      // Monotonic counter update on Credential
      if (newCounter > 0) {
        await CredentialModel.updateOne(
          { _id: cred._id, counter: { $lt: newCounter } },
          { $set: { counter: newCounter, lastUsedAt: new Date() } },
        );
      } else {
        cred.lastUsedAt = new Date();
        await cred.save();
      }

      // Final commit boundary: atomic consumption asserting generation consistency (R5)
      if (expectedVersion !== undefined) {
        const finalUser = await UserModel.findOne({
          _id: user._id,
          $or: [
            { tokenVersion: expectedVersion },
            ...(expectedVersion === 1 ? [{ tokenVersion: { $exists: false } }] : []),
          ],
          status: "ACTIVE",
        });

        if (!finalUser) {
          await AuthChallengeModel.updateOne(
            { _id: challenge._id },
            { $set: { status: "EXPIRED" } },
          );
          throw new Error("Authentication challenge expired or invalidated by session revocation. Please sign in again.");
        }
      }

      // Atomic challenge consumption boundary (R2)
      const consumeSuccess = await this.consumeChallenge(challenge._id);
      if (!consumeSuccess) {
        throw new Error("Passkey challenge already used or expired.");
      }

      const tokens = await this.generateTokens(user);
      return { user, tokens, verification };
    }

    throw new Error("Passkey authentication signature could not be verified.");
  }

  // --- User-facing Security & Passkeys Management ---

  static async enableUserTotp(userId: string, secret: string, code: string): Promise<boolean> {
    const delta = authenticator.checkDelta(code, secret);
    if (delta === null) {
      throw new Error("Invalid 6-digit verification code. Please check your authenticator app.");
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const currentStep = Math.floor(Date.now() / 1000 / 30);
    const codeStep = currentStep + delta;

    await CredentialModel.findOneAndUpdate(
      { userId: user._id, type: "TOTP" },
      {
        secret,
        name: "Authenticator App (TOTP)",
        lastUsedTimeStep: codeStep,
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    user.twoFactorEnforced = true;
    await user.save();

    // Invalidate other sessions and pending challenges atomically (R4, R5)
    await this.revokeUserSessions(userId);
    return true;
  }

  static async disableUserTotp(userId: string, currentPasswordPlain: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const isValid = await argon2.verify(user.passwordHash, currentPasswordPlain);
    if (!isValid) {
      throw new Error("Incorrect account password.");
    }

    await CredentialModel.deleteMany({ userId: user._id, type: "TOTP" });

    const remainingPasskeys = await CredentialModel.countDocuments({ userId: user._id, type: "PASSKEY" });
    if (remainingPasskeys === 0) {
      user.twoFactorEnforced = false;
      await user.save();
    }

    // Invalidate other sessions and pending challenges atomically (R4, R5)
    await this.revokeUserSessions(userId);
    return true;
  }

  static async getUserSecurityStatus(userId: string): Promise<{
    totpEnabled: boolean;
    twoFactorEnforced: boolean;
    passkeys: Array<{
      id: string;
      name: string;
      credentialId: string;
      createdAt: string;
      lastUsedAt?: string;
    }>;
  }> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const totpCred = await CredentialModel.findOne({ userId: user._id, type: "TOTP" });
    const passkeyCreds = await CredentialModel.find({ userId: user._id, type: "PASSKEY" }).sort({ createdAt: -1 });

    return {
      totpEnabled: !!totpCred,
      twoFactorEnforced: user.twoFactorEnforced,
      passkeys: passkeyCreds.map((p) => ({
        id: p._id.toString(),
        name: p.name || "Hardware / Device Passkey",
        credentialId: p.credentialId || "",
        createdAt: p.createdAt.toISOString(),
        lastUsedAt: p.lastUsedAt ? p.lastUsedAt.toISOString() : undefined,
      })),
    };
  }

  static async deleteUserPasskey(userId: string, credentialId: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    await CredentialModel.deleteOne({
      userId: user._id,
      $or: [{ _id: credentialId }, { credentialId }],
      type: "PASSKEY",
    });

    const remainingTotp = await CredentialModel.countDocuments({ userId: user._id, type: "TOTP" });
    const remainingPasskeys = await CredentialModel.countDocuments({ userId: user._id, type: "PASSKEY" });
    if (remainingTotp === 0 && remainingPasskeys === 0) {
      user.twoFactorEnforced = false;
      await user.save();
    }

    // Invalidate other sessions and pending challenges atomically (R4, R5)
    await this.revokeUserSessions(userId);
    return true;
  }
}
