import crypto from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";
import { authenticator } from "otplib";
import {
  connectToDatabase,
  disconnectDatabase,
  UserModel,
  OrganizationModel,
  DomainModel,
  CredentialModel,
  AuthChallengeModel,
} from "@cellsinbox/db";
import { AuthService, UserService, OrganizationService, DomainService } from "../dist/index.js";

const TEST_DB_URI = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017/cellsinbox_test_subbatch1b";

test("Sub-Batch 1B: Authentication Challenge Engine and Session Hardening", async (t) => {
  // Connect to isolated test database
  process.env.MONGODB_URI = TEST_DB_URI;
  await connectToDatabase(TEST_DB_URI);

  // Clean test collections before running
  await Promise.all([
    AuthChallengeModel.deleteMany({}),
    UserModel.deleteMany({ email: /@test-subbatch1b\.local$/ }),
    DomainModel.deleteMany({ name: /test-subbatch1b\.local$/ }),
    OrganizationModel.deleteMany({ slug: /^test-subbatch1b-/ }),
    CredentialModel.deleteMany({}),
  ]);

  const orgSlug = `test-subbatch1b-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "SubBatch1B Test Org",
    slug: orgSlug,
  });

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.test-subbatch1b.local`);

  await t.test("1. Challenge Creation, Hashing & Purpose Binding", async () => {
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

    // Plaintext token must NEVER be stored in the document
    const rawDoc = doc.toObject() as any;
    assert.equal(rawDoc.challengeToken, undefined, "Plaintext token must not be in MongoDB");

    // Purpose binding check: attempting to claim MFA_LOGIN as FIRST_LOGIN_ONBOARDING must fail
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(challengeToken, "FIRST_LOGIN_ONBOARDING");
      },
      /Invalid challenge purpose: expected FIRST_LOGIN_ONBOARDING/,
      "Purpose mismatch must be rejected",
    );
  });

  await t.test("2. Atomic Attempt Throttling and Single-Use Consumption", async () => {
    const { challengeToken } = await AuthService.createAuthChallenge({
      type: "MFA_LOGIN",
      maxAttempts: 5,
      expiresInSeconds: 300,
    });

    // Valid claim increments attempt
    const claimed1 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed1.attempts, 1, "First attempt should increment count to 1");

    const claimed2 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed2.attempts, 2, "Second attempt should increment count to 2");

    const claimed3 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed3.attempts, 3, "Third attempt should increment count to 3");

    const claimed4 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed4.attempts, 4, "Fourth attempt should increment count to 4");

    const claimed5 = await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
    assert.equal(claimed5.attempts, 5, "Fifth attempt should increment count to 5");

    // Exceeding 5 attempts must reject
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(challengeToken, "MFA_LOGIN");
      },
      /Maximum verification attempts exceeded/,
      "Sixth attempt must be rejected due to attempt limit",
    );

    // Consume challenge test
    const { challengeToken: freshToken } = await AuthService.createAuthChallenge({
      type: "MFA_LOGIN",
      maxAttempts: 5,
    });
    const freshClaimed = await AuthService.claimPendingChallenge(freshToken, "MFA_LOGIN");
    const consumed = await AuthService.consumeChallenge(freshClaimed._id);
    assert.equal(consumed, true, "consumeChallenge must return true");

    // Second claim of consumed challenge must fail
    await assert.rejects(
      async () => {
        await AuthService.claimPendingChallenge(freshToken, "MFA_LOGIN");
      },
      /Authentication challenge already used/,
      "Consumed challenge must reject subsequent claims",
    );
  });

  await t.test("3. Replay-Proof TOTP Verification (Step 2 of Login)", async () => {
    const { user, temporaryPassword } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `totp-user@${domain.name}`,
      displayName: "TOTP User",
      role: "MAILBOX_USER",
    });

    // Setup TOTP credential
    const secret = authenticator.generateSecret();
    const currentCode = authenticator.generate(secret);
    const step = Math.floor(Date.now() / 1000 / 30);

    await CredentialModel.create({
      userId: user._id,
      type: "TOTP",
      secret,
      name: "Authenticator App",
      lastUsedTimeStep: step - 1, // used in previous step
      lastUsedAt: new Date(Date.now() - 35000),
    });

    user.status = "ACTIVE";
    user.twoFactorEnforced = true;
    await user.save();

    // Create MFA_LOGIN challenge
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    // 1. Verify TOTP code with valid challenge
    const loginResult = await AuthService.verifyTotpForChallenge(challengeToken, currentCode);
    assert.equal(loginResult.user._id.toString(), user._id.toString());
    assert.ok(loginResult.tokens.accessToken, "Must issue accessToken");

    // 2. Immediate replay of the challenge token must fail
    await assert.rejects(
      async () => {
        await AuthService.verifyTotpForChallenge(challengeToken, currentCode);
      },
      /Authentication challenge already used/,
      "Replaying consumed challenge token must fail",
    );

    // 3. New challenge token but REPLAYING the exact same TOTP code in the same 30s window must fail
    const { challengeToken: replayChallengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: ["TOTP"],
    });

    await assert.rejects(
      async () => {
        await AuthService.verifyTotpForChallenge(replayChallengeToken, currentCode);
      },
      /TOTP code already used/,
      "Replaying same TOTP code in the same 30s window must be rejected",
    );
  });

  await t.test("4. Mandatory Security Onboarding Boundary (F01)", async () => {
    const { user, temporaryPassword } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `onboard-user@${domain.name}`,
      displayName: "Onboarding User",
      role: "MAILBOX_USER",
    });

    assert.equal(user.status, "PENDING_SECURITY_SETUP");

    // Validate password to trigger onboarding challenge
    const validated = await AuthService.validatePassword(user.email, temporaryPassword);
    const totpSetup = AuthService.generateTotpSetup(validated);
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: validated._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: totpSetup.secret,
    });

    const totpCode = authenticator.generate(totpSetup.secret);
    const newPassword = "BrandNewSecurePassword2026!";

    // Complete setup using the challenge token
    const result = await AuthService.completeFirstLoginSecuritySetup({
      challengeToken,
      newPassword,
      totpToken: totpCode,
    });

    assert.equal(result.user.status, "ACTIVE");
    assert.equal(result.user.twoFactorEnforced, true);
    assert.ok(result.tokens.accessToken);

    // Verify token version was incremented
    assert.equal(result.user.tokenVersion, 2, "Token version should be incremented from initial default 1 to 2");

    // Attempting to reuse the onboarding challenge must fail
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken,
          totpToken: totpCode,
        });
      },
      /Authentication challenge already used/,
      "Reusing completed onboarding challenge must fail",
    );

    // Direct call with dummy or forged challenge must fail
    await assert.rejects(
      async () => {
        await AuthService.completeFirstLoginSecuritySetup({
          challengeToken: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          totpToken: totpCode,
        });
      },
      /Authentication challenge expired or invalid/,
      "Forged challenge token must fail",
    );
  });

  await t.test("5. Session Revocation via tokenVersion (F05)", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `revocation-user@${domain.name}`,
      displayName: "Revocation User",
      role: "MAILBOX_USER",
    });

    user.status = "ACTIVE";
    await user.save();

    // Generate tokens with initial tokenVersion (1)
    const initialTokens = await AuthService.generateTokens(user);
    const initialPayload = await AuthService.verifyAccessToken(initialTokens.accessToken);
    assert.equal(initialPayload.tokenVersion, 1);

    // Revoke sessions by incrementing tokenVersion
    await AuthService.revokeUserSessions(user._id.toString());

    const updatedUser = await UserModel.findById(user._id);
    assert.equal(updatedUser?.tokenVersion, 2, "User tokenVersion in DB must be 2");

    // Verifying token payload still has version 1, which mismatches DB version 2
    assert.notEqual(initialPayload.tokenVersion, updatedUser?.tokenVersion);

    // Newly issued tokens should reflect tokenVersion 2
    const newTokens = await AuthService.generateTokens(updatedUser!);
    const newPayload = await AuthService.verifyAccessToken(newTokens.accessToken);
    assert.equal(newPayload.tokenVersion, 2);
  });

  await t.test("6. User and Tenant Lifecycle Enforcement (F05)", async () => {
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `lifecycle-user@${domain.name}`,
      displayName: "Lifecycle User",
      role: "MAILBOX_USER",
    });

    // Suspend user
    user.status = "SUSPENDED";
    await user.save();

    await assert.rejects(
      async () => {
        await AuthService.validatePassword(user.email, "somePassword");
      },
      /Account is suspended/,
      "Suspended user cannot validate password",
    );

    // Reactivate user and suspend organization
    user.status = "ACTIVE";
    await user.save();

    org.status = "SUSPENDED";
    await org.save();

    await assert.rejects(
      async () => {
        await AuthService.validatePassword(user.email, "somePassword");
      },
      /This organization has been suspended/,
      "User in suspended organization cannot validate password",
    );

    // Restore organization
    org.status = "ACTIVE";
    await org.save();
  });

  // Cleanup after all tests finish
  await Promise.all([
    AuthChallengeModel.deleteMany({}),
    UserModel.deleteMany({ email: /@test-subbatch1b\.local$/ }),
    DomainModel.deleteMany({ name: /test-subbatch1b\.local$/ }),
    OrganizationModel.deleteMany({ slug: /^test-subbatch1b-/ }),
    CredentialModel.deleteMany({}),
  ]);

  await disconnectDatabase();
});
