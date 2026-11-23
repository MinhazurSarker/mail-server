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
import { UserModel, CredentialModel, type IUser, type ICredential } from "@cellsinbox/db";
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
    };

    const accessToken = await new SignJWT(payload as Record<string, any>)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(env.JWT_EXPIRES_IN ? `${env.JWT_EXPIRES_IN}s` : "24h")
      .sign(this.getJwtSecret());

    const refreshToken = await new SignJWT({ userId: user._id.toString() })
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

  static async validatePassword(email: string, passwordPlain: string): Promise<IUser> {
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (user.status === "SUSPENDED" || user.status === "LOCKED") {
      throw new Error(`Account is ${user.status.toLowerCase()}. Please contact your organization administrator.`);
    }

    const isValid = await argon2.verify(user.passwordHash, passwordPlain);
    if (!isValid) {
      throw new Error("Invalid email or password.");
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

  static async verifyTotpCode(userId: string, code: string): Promise<boolean> {
    const cred = await CredentialModel.findOne({ userId, type: "TOTP" }).select("+secret");
    if (!cred || !cred.secret) {
      throw new Error("No TOTP authenticator enrolled for this account.");
    }

    const isValid = authenticator.check(code, cred.secret);
    if (isValid) {
      cred.lastUsedAt = new Date();
      await cred.save();
    }
    return isValid;
  }

  static async completeFirstLoginSecuritySetup(data: {
    userId: string;
    newPassword?: string;
    totpSecret?: string;
    totpToken?: string;
    passkeyCredential?: {
      credentialId: string;
      publicKey: string;
      counter: number;
    };
  }): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await UserModel.findById(data.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Must enroll at least one 2FA method
    if (!data.totpToken && !data.passkeyCredential) {
      throw new Error("Mandatory security setup: You must configure a Passkey or TOTP.");
    }

    // Verify and save TOTP if provided
    if (data.totpSecret && data.totpToken) {
      const isValid = authenticator.check(data.totpToken, data.totpSecret);
      if (!isValid) {
        throw new Error("Invalid TOTP verification code. Please scan the QR code and enter the 6 digits.");
      }

      await CredentialModel.create({
        userId: user._id,
        type: "TOTP",
        secret: data.totpSecret,
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
    const savedUser = await user.save();
    const tokens = await this.generateTokens(savedUser);

    return { user: savedUser, tokens };
  }

  // --- WebAuthn Passkeys ---

  static async generatePasskeyRegistrationOptions(user: IUser) {
    const userCredentials = await CredentialModel.find({ userId: user._id, type: "PASSKEY" });
    const excludeCredentials = userCredentials.map((c) => ({
      id: c.credentialId!,
      transports: c.transports as any,
    }));

    const options = await generateRegistrationOptions({
      rpName: "CellsInbox Enterprise",
      rpID: new URL(env.FRONTEND_URL || "http://localhost:3000").hostname,
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

    return options;
  }

  static async verifyPasskeyRegistration(
    user: IUser,
    response: RegistrationResponseJSON,
    expectedChallenge: string,
  ) {
    const expectedOrigin = env.FRONTEND_URL || "http://localhost:3000";
    const expectedRPID = new URL(expectedOrigin).hostname;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
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
    }

    return verification;
  }

  static async generatePasskeyAuthenticationOptions(user?: IUser) {
    let allowCredentials: any[] = [];
    if (user) {
      const creds = await CredentialModel.find({ userId: user._id, type: "PASSKEY" });
      allowCredentials = creds.map((c) => ({
        id: c.credentialId!,
        transports: c.transports as any,
      }));
    }

    const options = await generateAuthenticationOptions({
      rpID: new URL(env.FRONTEND_URL || "http://localhost:3000").hostname,
      allowCredentials,
      userVerification: "preferred",
    });

    return options;
  }

  static async verifyPasskeyAuthentication(
    user: IUser,
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
  ) {
    const expectedOrigin = env.FRONTEND_URL || "http://localhost:3000";
    const expectedRPID = new URL(expectedOrigin).hostname;

    const cred = await CredentialModel.findOne({
      userId: user._id,
      credentialId: response.id,
      type: "PASSKEY",
    });

    if (!cred || !cred.publicKey) {
      throw new Error("Passkey credential not registered for this account.");
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
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
    }

    return verification;
  }

  // --- User-facing Security & Passkeys Management ---

  private static challenges = new Map<string, { challenge: string; expiresAt: number }>();

  static setChallenge(key: string, challenge: string): void {
    this.challenges.set(key, {
      challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
  }

  static getChallenge(key: string): string | null {
    const entry = this.challenges.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.challenges.delete(key);
      return null;
    }
    this.challenges.delete(key);
    return entry.challenge;
  }

  static async enableUserTotp(userId: string, secret: string, code: string): Promise<boolean> {
    const isValid = authenticator.check(code, secret);
    if (!isValid) {
      throw new Error("Invalid 6-digit verification code. Please check your authenticator app.");
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    await CredentialModel.findOneAndUpdate(
      { userId: user._id, type: "TOTP" },
      {
        secret,
        name: "Authenticator App (TOTP)",
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    user.twoFactorEnforced = true;
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
      await user.save();
    }
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
    return true;
  }
}
