import test from "node:test";
import assert from "node:assert/strict";
import { authenticator } from "otplib";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  UserModel,
  OrganizationModel,
  DomainModel,
  CredentialModel,
  AuthChallengeModel,
} from "@cellsinbox/db";
import { AuthService, UserService, OrganizationService, DomainService } from "../dist/index.js";

const TEST_DB_NAME = `cellsinbox_test_r3r5_${Date.now()}`;

test("R3 & R5 Regression Reproductions against Isolated MongoDB", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `r3r5-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "R3 R5 Test Org",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.local`);

  await t.test("R3 Concurrency: Losing challenge B must NOT overwrite winning factor A", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `r3-winner-${Date.now()}@${domain.name}`,
      displayName: "R3 Winner User",
      role: "MAILBOX_USER",
    });

    const secretA = authenticator.generateSecret();
    const secretB = authenticator.generateSecret();

    const { challengeToken: tokenA } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: secretA,
    });

    const { challengeToken: tokenB } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: secretB,
    });

    const codeA = authenticator.generate(secretA);
    const codeB = authenticator.generate(secretB);

    // 1. Challenge A completes successfully
    const resA = await AuthService.completeFirstLoginSecuritySetup({
      challengeToken: tokenA,
      newPassword: "PasswordA12345!",
      totpToken: codeA,
    });
    assert.equal(resA.user.status, "ACTIVE");

    // 2. Challenge B attempts to complete
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken: tokenB,
          newPassword: "PasswordB12345!",
          totpToken: codeB,
        });
      },
      /already completed security setup|already activated|Invalid or expired|credentials or sessions have been revoked/,
    );

    // 3. Winning secretA must be preserved in CredentialModel
    const cred = await CredentialModel.findOne({ userId: user._id, type: "TOTP" }).select("+secret");
    assert.equal(cred?.secret, secretA, "Winning factor secretA must remain unchanged!");
  });

  await t.test("R5 Race: In-flight challenge from tokenVersion 1 cannot issue tokenVersion 2 after revocation", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `r5-race-${Date.now()}@${domain.name}`,
      displayName: "R5 Race User",
      role: "MAILBOX_USER",
    });

    user.status = "ACTIVE";
    user.tokenVersion = 1;
    await user.save();

    const secret = authenticator.generateSecret();
    const step = Math.floor(Date.now() / 1000 / 30);
    await CredentialModel.create({
      userId: user._id,
      type: "TOTP",
      secret,
      lastUsedTimeStep: step - 1,
    });

    // Challenge created under tokenVersion 1
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    const chalDoc = await AuthChallengeModel.findOne({ challengeToken: undefined, userId: user._id });
    assert.equal(chalDoc?.userTokenVersion, 1);

    const validCode = authenticator.generate(secret);

    // Revoke sessions BEFORE or DURING verification
    await AuthService.revokeUserSessions(user._id.toString());
    const refreshedUser = await UserModel.findById(user._id);
    assert.equal(refreshedUser?.tokenVersion, 2);

    // Attempting to verify the challenge issued under version 1 MUST FAIL
    await assert.rejects(
      async () => {
        await AuthService.verifyTotpForChallenge(challengeToken, validCode);
      },
      /Authentication challenge (is invalid|expired|invalid or expired|no longer valid)/,
      "Challenge issued under tokenVersion 1 must never issue tokenVersion 2",
    );
  });

  await t.test("R3 Failure Recovery: Injected failure during completion leaves account recoverable", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `r3-recovery-${Date.now()}@${domain.name}`,
      displayName: "R3 Recovery User",
      role: "MAILBOX_USER",
    });

    const secret = authenticator.generateSecret();
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: secret,
      maxAttempts: 5,
    });

    // 1. First attempt fails due to invalid code (injected user error)
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken,
          totpToken: "999999",
        });
      },
      /Invalid (TOTP )?verification code/,
    );

    // Verify user is STILL in PENDING_SECURITY_SETUP (not half-activated)
    const checkUser1 = await UserModel.findById(user._id);
    assert.equal(checkUser1?.status, "PENDING_SECURITY_SETUP");

    // 2. Retry with valid code succeeds cleanly
    const validCode = authenticator.generate(secret);
    const successRes = await AuthService.completeFirstLoginSecuritySetup({
      challengeToken,
      newPassword: "RecoveredPassword2026!",
      totpToken: validCode,
    });

    assert.equal(successRes.user.status, "ACTIVE");
    assert.equal(successRes.user.twoFactorEnforced, true);

    const cred = await CredentialModel.findOne({ userId: user._id, type: "TOTP" });
    assert.ok(cred, "Credential must be successfully enrolled after recovery");
  });
});
