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
    const payload: TokenPayload = {
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      domainId: user.domainId.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      tokenVersion: user.tokenVersion || 1,
    };

    const accessToken = await new SignJWT(payload as unknown as Record<string, any>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN ? `${env.JWT_EXPIRES_IN}s` : "24h")
      .sign(this.getJwtSecret());

    const refreshToken = await new SignJWT({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion || 1,
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

  static async revokeUserSessions(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  }

  // --- AuthChallenge Engine ---

  static async createAuthChallenge(params: {
    userId?: string | Types.ObjectId;
    type: AuthChallengeType;
    factorsRequired?: string[];
    passkeyChallenge?: string;
    totpSecretPending?: string;
    maxAttempts?: number;
    expiresInSeconds?: number;
  }): Promise<{ challengeToken: string; expiresAt: Date }> {
    const challengeToken = crypto.randomBytes(32).toString("hex");
    const challengeHash = crypto.createHash("sha256").update(challengeToken).digest("hex");
    const expiresIn = params.expiresInSeconds || 300; // 5 minutes default
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await AuthChallengeModel.create({
      userId: params.userId ? (typeof params.userId === "string" ? new Types.ObjectId(params.userId) : params.userId) : undefined,
      challengeHash,
      type: params.type,
      status: "PENDING",
      factorsRequired: params.factorsRequired || [],
      factorsVerified: [],
      passkeyChallenge: params.passkeyChallenge,
      totpSecretPending: params.totpSecretPending,
      attempts: 0,
      maxAttempts: params.maxAttempts || 5,
      expiresAt,
    });

    return { challengeToken, expiresAt };
  }

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

    // Atomic find and increment attempt count while ensuring challenge is PENDING, not expired, and attempts < maxAttempts
    const challenge = await AuthChallengeModel.findOneAndUpdate(
      {
        challengeHash,
        status: "PENDING",
        expiresAt: { $gt: now },
        attempts: { $lt: 5 },
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

    if (challenge.type !== expectedType) {
      throw new Error(`Invalid challenge purpose: expected ${expectedType}`);
    }

    return challenge;
  }

  static async consumeChallenge(challengeId: Types.ObjectId | string): Promise<boolean> {
    const res = await AuthChallengeModel.updateOne(
      { _id: challengeId, status: "PENDING" },
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

    if (user.role !== "PLATFORM_ADMIN") {
      const org = await OrganizationModel.findById(user.organizationId);
      if (org && org.status === "SUSPENDED") {
        throw new Error("This organization has been suspended by platform administration. Contact support.");
      }
    }

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

    if (user.role !== "PLATFORM_ADMIN") {
      const org = await OrganizationModel.findById(user.organizationId);
      if (!org || org.status === "SUSPENDED") {
        throw new Error("This organization has been suspended by platform administration. Contact support.");
      }
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

    if (cred.lastUsedTimeStep && codeStep <= cred.lastUsedTimeStep) {
      throw new Error("TOTP code already used. Please wait for the next 30-second code.");
    }

    cred.lastUsedTimeStep = codeStep;
    cred.lastUsedAt = new Date();
    await cred.save();

    await this.consumeChallenge(challenge._id);

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  // --- Onboarding Completion ---

  static async completeFirstLoginSecuritySetup(data: {
    challengeToken: string;
    newPassword?: string;
    totpToken?: string;
    passkeyCredential?: {
      credentialId: string;
      publicKey: string;
      counter: number;
    };
  }): Promise<{ user: IUser; tokens: AuthTokens }> {
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

    if (user.role !== "PLATFORM_ADMIN") {
      const org = await OrganizationModel.findById(user.organizationId);
      if (!org || org.status === "SUSPENDED") {
        throw new Error("This organization has been suspended by platform administration. Contact support.");
      }
    }

    // Must enroll at least one 2FA method
    if (!data.totpToken && !data.passkeyCredential) {
      throw new Error("Mandatory security setup: You must configure a Passkey or TOTP.");
    }

    // Verify and save TOTP if provided
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
      const codeStep = currentStep + delta;

      await CredentialModel.create({
        userId: user._id,
        type: "TOTP",
        secret,
        name: "Authenticator App (TOTP)",
        lastUsedTimeStep: codeStep,
        lastUsedAt: new Date(),
      });
    }

    // Register Passkey if provided
    if (data.passkeyCredential) {
      await CredentialModel.create({
        userId: user._id,
        type: "PASSKEY",
        credentialId: data.passkeyCredential.credentialId,
        publicKey: data.passkeyCredential.publicKey,
        counter: data.passkeyCredential.counter,
      });
    }

    // Update password if changed from temporary
    if (data.newPassword && data.newPassword.trim().length >= 8) {
      user.passwordHash = await argon2.hash(data.newPassword.trim());
    }

    user.status = "ACTIVE";
    user.twoFactorEnforced = true;
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    const savedUser = await user.save();

    await this.consumeChallenge(challenge._id);

    const tokens = await this.generateTokens(savedUser);
    return { user: savedUser, tokens };
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
      ? (host && host.includes(":") ? `http://${host}` : `http://${cleanCandidate}:3000`)
      : `https://${cleanCandidate}`;
    return { cleanHost: cleanCandidate, expectedOrigin };
  }

  static async generatePasskeyRegistrationOptions(user: IUser, host?: string) {
    const userCredentials = await CredentialModel.find({ userId: user._id, type: "PASSKEY" });
    const excludeCredentials = userCredentials.map((c) => ({
      id: c.credentialId!,
      transports: c.transports as any,
    }));

    const { cleanHost } = this.resolveHostAndOrigin(host);

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
    });

    return { options, challengeToken };
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
          attempts: { $lt: 5 },
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
    const expectedRPID = cleanHost;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.passkeyChallenge,
      expectedOrigin,
      expectedRPID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      await CredentialModel.create({
        userId: user._id,
        type: "PASSKEY",
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        counter: credential.counter,
      });

      await this.consumeChallenge(challenge._id);
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

    const { cleanHost } = this.resolveHostAndOrigin(host);

    const options = await generateAuthenticationOptions({
      rpID: cleanHost,
      allowCredentials,
      userVerification: "preferred",
    });

    const { challengeToken } = await this.createAuthChallenge({
      userId: user ? user._id : undefined,
      type: "PASSKEY_AUTH",
      passkeyChallenge: options.challenge,
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

    const user = await UserModel.findById(cred.userId);
    if (!user) {
      throw new Error("User associated with this Passkey not found.");
    }

    if (user.status !== "ACTIVE") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Access denied.`);
    }

    if (user.role !== "PLATFORM_ADMIN") {
      const org = await OrganizationModel.findById(user.organizationId);
      if (org && org.status === "SUSPENDED") {
        throw new Error("This organization has been suspended by platform administration. Contact support.");
      }
    }

    const { cleanHost, expectedOrigin } = this.resolveHostAndOrigin(host);
    const expectedRPID = cleanHost;

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.passkeyChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: cred.credentialId!,
        publicKey: Buffer.from(cred.publicKey, "base64"),
        counter: cred.counter || 0,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      cred.counter = verification.authenticationInfo.newCounter;
      cred.lastUsedAt = new Date();
      await cred.save();

      await this.consumeChallenge(challenge._id);
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
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();
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
    }
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();
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
    }
    user.tokenVersion = (user.tokenVersion || 1) + 1;
    await user.save();
    return true;
  }
}
