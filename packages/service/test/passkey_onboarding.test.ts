import test from "node:test";
import assert from "node:assert/strict";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  AuthChallengeModel,
} from "@cellsinbox/db";
import { AuthService, UserService, OrganizationService, DomainService } from "../dist/index.js";

const TEST_DB_NAME = `cellsinbox_test_passkey_onb_${Date.now()}`;

test("Priority 5: Genuine WebAuthn Passkey Onboarding Registration Options", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `passkey-onb-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "Passkey Onboarding Org",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.local`);

  const { user, temporaryPassword } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: `passkey-user-${Date.now()}@${domain.name}`,
    displayName: "Passkey Onboarding User",
    role: "MAILBOX_USER",
  });

  // 1. Password validation generates onboarding challenge
  const validated = await AuthService.validatePassword(user.email, temporaryPassword);
  assert.equal(validated.status, "PENDING_SECURITY_SETUP");

  const { challengeToken } = await AuthService.createAuthChallenge({
    userId: validated._id,
    type: "FIRST_LOGIN_ONBOARDING",
    factorsRequired: ["PASSKEY"],
  });

  // 2. Request genuine WebAuthn registration options bound to onboarding challenge
  const host = "webmail.cellsweb.com";
  const { options } = await AuthService.generateOnboardingPasskeyOptions(challengeToken, host);

  assert.ok(options, "Must return PublicKeyCredentialCreationOptions");
  assert.equal(options.rp.name, "CellsInbox Sovereign Mail");
  assert.equal(options.rp.id, "webmail.cellsweb.com");
  assert.equal(options.user.name, user.email);
  assert.ok(options.challenge, "Challenge string must be generated");
  assert.ok(options.pubKeyCredParams.length > 0, "Public key parameters must be configured");

  // 3. Challenge in MongoDB must have passkeyChallenge and expectedRPID bound
  const chalDoc = await AuthChallengeModel.findOne({
    userId: user._id,
    type: "FIRST_LOGIN_ONBOARDING",
  });
  assert.ok(chalDoc);
  assert.equal(chalDoc.passkeyChallenge, options.challenge);
  assert.equal(chalDoc.expectedRPID, "webmail.cellsweb.com");
  assert.equal(chalDoc.expectedOrigin, "https://webmail.cellsweb.com");

  // 4. Verifying invalid or fabricated passkey response is safely rejected
  await assert.rejects(
    async () => {
      await AuthService.completeFirstLoginSecuritySetup({
        challengeToken,
        passkeyResponse: {
          id: "fake_id",
          rawId: "fake_raw_id",
          response: {
            clientDataJSON: Buffer.from("{}").toString("base64url"),
            attestationObject: Buffer.from("{}").toString("base64url"),
          },
          type: "public-key",
          clientExtensionResults: {},
        } as any,
      });
    },
    /Passkey registration verification failed|clientDataJSON|Unexpected token|Credential ID was not base64url-encoded/,
  );
});
