import crypto from "node:crypto";
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

const TEST_DB_NAME = "cellsinbox_test_auth_challenge";

test("Sub-Batch 1B: Authentication Challenge Engine and Session Hardening", async (t) => {
  // Connect to isolated, disposable test database
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `test-1b-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "SubBatch1B Test Org",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.test-subbatch1b.local`);

  await t.test("1. Challenge Creation, Hashing & Purpose Binding (R11)", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `user1@${domain.name}`,
      displayName: "User One",
      role: "MAILBOX_USER",
    });

    const { challengeToken, expiresAt } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
      expiresInSeconds: 300,
    });

    assert.ok(challengeToken, "Challenge token must be generated");
    assert.equal(challengeToken.length, 64, "Token should be 32 bytes hex (64 chars)");
    assert.ok(expiresAt.getTime() > Date.now(), "Expiration should be in the future");

    // Verify hash at rest
    const expectedHash = crypto.createHash("sha256").update(challengeToken).digest("hex");
    const doc = await AuthChallengeModel.findOne({ challengeHash: expectedHash });

    assert.ok(doc, "Challenge document must exist by challengeHash");
    assert.equal(doc.status, "PENDING", "Initial status must be PENDING");
    assert.equal(doc.attempts, 0, "Initial attempts must be 0");
    assert.equal(doc.type, "MFA_LOGIN", "Type must be MFA_LOGIN");
    assert.equal(doc.userId?.toString(), user._id.toString(), "User ID must match");
    assert.equal(doc.userTokenVersion, 1, "User token version must be recorded");

    // Plaintext token must NEVER be stored in the document
    const rawDoc = doc.toObject() as any;
    assert.equal(rawDoc.challengeToken, undefined, "Plaintext token must not be in MongoDB");

    // Purpose binding check: attempting to claim MFA_LOGIN as FIRST_LOGIN_ONBOARDING must fail without spending attempts
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(challengeToken, "FIRST_LOGIN_ONBOARDING");
      },
      /Invalid challenge purpose/,
      "Purpose mismatch must be rejected",
    );

    const docAfterMismatch = await AuthChallengeModel.findById(doc._id);
    assert.equal(docAfterMismatch?.attempts, 0, "Purpose mismatch must not spend attempts (R11)");
  });

  await t.test("2. Atomic Dynamic Attempt Throttling (R11)", async () => {
    const { challengeToken } = await AuthService.createAuthChallenge({
      type: "MFA_LOGIN",
      maxAttempts: 3,
      expiresInSeconds: 300,
    });

    // Valid claim increments attempt dynamically up to maxAttempts
    const claimed1 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed1.attempts, 1);

    const claimed2 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed2.attempts, 2);

    const claimed3 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed3.attempts, 3);

    // Exceeding 3 attempts must reject
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
      },
      /Maximum verification attempts exceeded/,
      "Attempt beyond maxAttempts must be rejected",
    );
  });

  await t.test("3. Concurrent Challenge Claim & TOTP Replay Prevention (R2)", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `totp-race@${domain.name}`,
      displayName: "TOTP Race User",
      role: "MAILBOX_USER",
    });

    const secret = authenticator.generateSecret();
    const currentCode = authenticator.generate(secret);
    const step = Math.floor(Date.now() / 1000 / 30);

    await CredentialModel.create({
      userId: user._id,
      type: "TOTP",
      secret,
      name: "Authenticator App",
      lastUsedTimeStep: step - 1,
    });

    user.status = "ACTIVE";
    user.twoFactorEnforced = true;
    await user.save();

    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    // Barrier-synchronized concurrent TOTP verification of the same challenge
    const results = await Promise.allSettled([
      AuthService.verifyTotpForChallenge(challengeToken, currentCode),
      AuthService.verifyTotpForChallenge(challengeToken, currentCode),
      AuthService.verifyTotpForChallenge(challengeToken, currentCode),
      AuthService.verifyTotpForChallenge(challengeToken, currentCode),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one concurrent verification must succeed");
    assert.equal(rejected.length, 3, "All other concurrent verifications must be rejected");

    // Cross-challenge concurrent replay: two challenges, same TOTP step
    const { challengeToken: chalA } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    await assert.rejects(
      async () => {
        await AuthService.verifyTotpForChallenge(chalA, currentCode);
      },
      /TOTP code already used/,
      "Replaying same TOTP code in the same 30s window across challenges must fail",
    );
  });

  await t.test("4. Raw Passkey Rejection during Onboarding (R1)", async () => {
    const { user, temporaryPassword } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `passkey-raw@${domain.name}`,
      displayName: "Passkey Raw User",
      role: "MAILBOX_USER",
    });

    const validated = await AuthService.validatePassword(user.email, temporaryPassword);
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: validated._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["PASSKEY"],
    });

    // Attempting to supply unverified passkeyCredential must be explicitly rejected
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken,
          passkeyCredential: {
            id: "fake-credential-id",
            publicKey: "fake-public-key",
            counter: 0,
          } as any,
        });
      },
      /Raw passkey credentials are not accepted/,
      "Must reject unverified raw passkey credential",
    );

    // Verify user remains PENDING_SECURITY_SETUP
    const unchangedUser = await UserModel.findById(user._id);
    assert.equal(unchangedUser?.status, "PENDING_SECURITY_SETUP");
  });

  await t.test("5. Onboarding State Machine & Partial Failure Recovery (R3)", async () => {
    const { user, temporaryPassword } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `onboard-state@${domain.name}`,
      displayName: "Onboard State User",
      role: "MAILBOX_USER",
    });

    const validated = await AuthService.validatePassword(user.email, temporaryPassword);
    const totpSetup = AuthService.generateTotpSetup(validated);
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: validated._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: totpSetup.secret,
      maxAttempts: 5,
    });

    // 1. Partial failure: wrong TOTP code
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken,
          newPassword: "BrandNewPassword2026!",
          totpToken: "000000",
        });
      },
      /Invalid (TOTP )?verification code/,
      "Wrong TOTP code must fail",
    );

    // Verify user is still pending
    const pendingUser = await UserModel.findById(user._id);
    assert.equal(pendingUser?.status, "PENDING_SECURITY_SETUP");

    // 2. Retry with valid TOTP code succeeds
    const validCode = authenticator.generate(totpSetup.secret);
    const successResult = await AuthService.completeFirstLoginSecuritySetup({
      challengeToken,
      newPassword: "BrandNewPassword2026!",
      totpToken: validCode,
    });

    assert.equal(successResult.user.status, "ACTIVE");
    assert.equal(successResult.user.twoFactorEnforced, true);
    assert.equal(successResult.user.tokenVersion, 2);

    // 3. Duplicate completion attempt must fail
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken,
          newPassword: "BrandNewPassword2026!",
          totpToken: validCode,
        });
      },
      /Authentication challenge already used/,
      "Cannot reuse consumed onboarding challenge",
    );
  });

  await t.test("6. Legacy User Session Revocation & Pending Challenge Invalidation (R4, R5)", async () => {
    // Create user and explicitly unset tokenVersion to simulate legacy user record
    const { user: legacyDoc } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `legacy-${Date.now()}@${domain.name}`,
      displayName: "Legacy User",
      role: "MAILBOX_USER",
    });

    legacyDoc.status = "ACTIVE";
    await UserModel.updateOne({ _id: legacyDoc._id }, { $unset: { tokenVersion: 1 } });
    const rawLegacy = await UserModel.collection.findOne({ _id: legacyDoc._id });
    assert.equal(rawLegacy?.tokenVersion, undefined, "MongoDB document must have undefined tokenVersion");

    // Initial token payload treats undefined as 1
    const freshLegacyDoc = (await UserModel.findById(legacyDoc._id))!;
    const legacyTokens = await AuthService.generateTokens(freshLegacyDoc);
    const legacyPayload = await AuthService.verifyAccessToken(legacyTokens.accessToken);
    assert.equal(legacyPayload.tokenVersion, 1);

    // Create a pending challenge before revocation
    const { challengeToken: pendingToken } = await AuthService.createAuthChallenge({
      userId: freshLegacyDoc._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    // Revoke sessions
    await AuthService.revokeUserSessions(freshLegacyDoc._id.toString());

    // User in DB should now have tokenVersion 2
    const updatedRaw = await UserModel.collection.findOne({ _id: legacyDoc._id });
    assert.equal(updatedRaw?.tokenVersion, 2, "Legacy user without tokenVersion must be incremented to 2");

    // Pending challenge should be invalidated
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(pendingToken, "MFA_LOGIN");
      },
      /Authentication challenge (is no longer valid|invalid or expired)/,
      "Pending challenge must be invalidated after session revocation (R5)",
    );
  });

  await t.test("7. Centralized Tenant Lifecycle Enforcement (R9)", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `tenant-lifecycle@${domain.name}`,
      displayName: "Lifecycle User",
      role: "MAILBOX_USER",
    });

    // 1. ACTIVE org & user -> succeeds
    user.status = "ACTIVE";
    await user.save();
    await AuthService.assertActiveTenant(user); // Does not throw

    // 2. User SUSPENDED -> throws Account is suspended
    user.status = "SUSPENDED";
    await user.save();
    await assert.rejects(
      async () => {
        await AuthService.assertActiveTenant(user);
      },
      /Account is suspended/,
    );

    // 3. Org PENDING_APPROVAL -> throws pending approval
    user.status = "ACTIVE";
    await user.save();
    org.status = "PENDING_APPROVAL";
    await org.save();
    await assert.rejects(
      async () => {
        await AuthService.assertActiveTenant(user);
      },
      /pending approval/,
    );

    // 4. Org SUSPENDED -> throws suspended
    org.status = "SUSPENDED";
    await org.save();
    await assert.rejects(
      async () => {
        await AuthService.assertActiveTenant(user);
      },
      /This organization has been suspended/,
    );

    // Restore org
    org.status = "ACTIVE";
    await org.save();

    // 5. User without organization: non-platform admin rejected
    const orphanUser = new UserModel({
      email: "orphan@unknown.local",
      role: "MAILBOX_USER",
      status: "ACTIVE",
    });
    await assert.rejects(
      async () => {
        await AuthService.assertActiveTenant(orphanUser);
      },
      /User has no assigned organization/,
    );

    // Platform admin without organization: permitted
    const platformAdmin = new UserModel({
      email: "admin@platform.local",
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
    });
    await AuthService.assertActiveTenant(platformAdmin); // Does not throw
  });

  // Teardown: drop test database and disconnect
  await cleanupTestDatabase();
});
