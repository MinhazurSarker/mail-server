import test from "node:test";
import assert from "node:assert/strict";
import { authenticator } from "otplib";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  CredentialModel,
} from "@cellsinbox/db";
import { OrganizationService, DomainService, UserService, AuthService } from "../dist/index.js";

const TEST_DB_NAME = "cellsinbox_test_auth_flow";

test("End-to-End Authentication and Security Onboarding Flow", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `test-flow-${Date.now()}`;
  const domainName = `${orgSlug}.local`;
  const userEmail = `alice@${domainName}`;

  // 1. Create Organization & Domain
  const org = await OrganizationService.createOrganization({
    name: "Flow Test Organization",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), domainName);

  // 2. Admin creates User with temporary password
  const { user, temporaryPassword } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: userEmail,
    displayName: "Alice Tester",
    role: "MAILBOX_USER",
  });

  assert.equal(user.status, "PENDING_SECURITY_SETUP");

  // 3. User validates temporary password on first login
  const validatedUser = await AuthService.validatePassword(userEmail, temporaryPassword);
  assert.equal(validatedUser.status, "PENDING_SECURITY_SETUP");

  // 4. Generate TOTP Setup Secret
  const totpSetup = AuthService.generateTotpSetup(validatedUser);
  assert.ok(totpSetup.secret, "TOTP secret must be generated");

  // 5. Create server-bound FIRST_LOGIN_ONBOARDING challenge
  const { challengeToken } = await AuthService.createAuthChallenge({
    userId: validatedUser._id,
    type: "FIRST_LOGIN_ONBOARDING",
    factorsRequired: ["TOTP"],
    totpSecretPending: totpSetup.secret,
    expiresInSeconds: 300,
  });

  // 6. Complete Mandatory Onboarding
  const validToken = authenticator.generate(totpSetup.secret);
  const permanentPassword = "PermanentPassword2026!";

  const onboardingResult = await AuthService.completeFirstLoginSecuritySetup({
    challengeToken,
    newPassword: permanentPassword,
    totpToken: validToken,
  });

  assert.equal(onboardingResult.user.status, "ACTIVE");
  assert.equal(onboardingResult.user.twoFactorEnforced, true);
  assert.equal(onboardingResult.user.tokenVersion, 2);
  assert.ok(onboardingResult.tokens.accessToken);

  // 7. Verify Access Token
  const verifiedToken = await AuthService.verifyAccessToken(onboardingResult.tokens.accessToken);
  assert.equal(verifiedToken.email, userEmail);
  assert.equal(verifiedToken.role, "MAILBOX_USER");
  assert.equal(verifiedToken.tokenVersion, 2);

  // 8. Subsequent Login Step 1: Password validation
  const subsequentUser = await AuthService.validatePassword(userEmail, permanentPassword);
  assert.equal(subsequentUser.status, "ACTIVE");
  assert.equal(subsequentUser.twoFactorEnforced, true);

  // 9. Subsequent Login Step 2: MFA Challenge Creation and Verification
  const { challengeToken: mfaChallengeToken } = await AuthService.createAuthChallenge({
    userId: subsequentUser._id,
    type: "MFA_LOGIN",
    factorsRequired: ["TOTP"],
    expiresInSeconds: 300,
  });

  // Replaying the TOTP code in the same 30s window without advancing step must fail (R2)
  await assert.rejects(
    async () => {
      await AuthService.verifyTotpForChallenge(mfaChallengeToken, validToken);
    },
    /TOTP code already used/,
    "Replaying same TOTP code in the same 30s window must fail (R2)",
  );

  // Advance credential lastUsedTimeStep to step - 1 to simulate next time step
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  await CredentialModel.updateOne(
    { userId: subsequentUser._id, type: "TOTP" },
    { $set: { lastUsedTimeStep: currentStep - 1 } },
  );

  const mfaResult = await AuthService.verifyTotpForChallenge(mfaChallengeToken, validToken);
  assert.equal(mfaResult.user._id.toString(), subsequentUser._id.toString());
  assert.ok(mfaResult.tokens.accessToken);

  const verifiedSubsequentToken = await AuthService.verifyAccessToken(mfaResult.tokens.accessToken);
  assert.equal(verifiedSubsequentToken.userId, subsequentUser._id.toString());
  assert.equal(verifiedSubsequentToken.tokenVersion, 2);

  // Cleanup
  await cleanupTestDatabase();
});
