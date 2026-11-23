import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  connectToDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
} from "@cellsinbox/db";
import { UserService, OrganizationService } from "../src/index.js";

describe("User and Organization Policy Settings Flow", () => {
  let testOrgId: string;
  let testDomainId: string;
  let testUserId: string;
  let tempPassword = "";

  before(async () => {
    await connectToDatabase();

    const org = await OrganizationService.createOrganization({
      name: "Policy Settings Test Org",
      slug: `policy-test-${Date.now()}`,
    });
    testOrgId = org._id.toString();

    const domain = new DomainModel({
      organizationId: org._id,
      name: `policy-${Date.now()}.local`,
      verificationToken: "token_abc",
      dkimSelector: "ci",
      dkimPrivateKey: "private_key",
      dkimPublicKey: "public_key",
      isVerified: true,
    });
    const savedDomain = await domain.save();
    testDomainId = savedDomain._id.toString();

    const created = await UserService.createUser({
      organizationId: testOrgId,
      domainId: testDomainId,
      email: `user-settings-${Date.now()}@policy.local`,
      displayName: "Original User",
      role: "MAILBOX_USER",
    });
    testUserId = created.user._id.toString();
    tempPassword = created.temporaryPassword;
  });

  after(async () => {
    if (testOrgId) {
      await UserModel.deleteMany({ organizationId: testOrgId });
      await DomainModel.deleteMany({ organizationId: testOrgId });
      await OrganizationModel.findByIdAndDelete(testOrgId);
    }
    await disconnectDatabase();
  });

  it("should fetch default user settings and preferences", async () => {
    const settings = await UserService.getSettings(testUserId);
    assert.ok(settings);
    assert.equal(settings.displayName, "Original User");
    assert.equal(settings.preferences.autoSaveDrafts, true);
    assert.equal(settings.preferences.sendReadReceipts, false);
    assert.equal(settings.preferences.desktopNotifications, true);
    assert.equal(settings.preferences.defaultFormat, "html");
    assert.equal(settings.preferences.signature, "");
  });

  it("should update user display name and preferences", async () => {
    await UserService.updateSettings(testUserId, {
      displayName: "Alice Updated",
      preferences: {
        signature: "--\nAlice Updated | Security Lead",
        autoSaveDrafts: false,
        sendReadReceipts: true,
        desktopNotifications: false,
        defaultFormat: "text",
      },
    });

    const updated = await UserService.getSettings(testUserId);
    assert.equal(updated.displayName, "Alice Updated");
    assert.equal(updated.preferences.signature, "--\nAlice Updated | Security Lead");
    assert.equal(updated.preferences.autoSaveDrafts, false);
    assert.equal(updated.preferences.sendReadReceipts, true);
    assert.equal(updated.preferences.desktopNotifications, false);
    assert.equal(updated.preferences.defaultFormat, "text");
  });

  it("should reject password change with incorrect current password", async () => {
    await assert.rejects(
      async () => {
        await UserService.changePassword(testUserId, "WrongPassword123!", "NewSecretPass456!");
      },
      /Current password is incorrect/,
    );
  });

  it("should successfully change password and verify updated hash", async () => {
    await UserService.changePassword(testUserId, tempPassword, "StrongBrandNewPass789!");

    // Verify trying to change with old tempPassword fails now
    await assert.rejects(
      async () => {
        await UserService.changePassword(testUserId, tempPassword, "AnotherPass1234!");
      },
      /Current password is incorrect/,
    );

    // Verify changing with new password succeeds
    await UserService.changePassword(testUserId, "StrongBrandNewPass789!", "AnotherPass1234!");
  });

  it("should fetch organization default security policies", async () => {
    const policy = await OrganizationService.getPolicyConfig(testOrgId);
    assert.equal(policy.enforceTwoFactor, true);
    assert.equal(policy.spamThresholdScore, 5);
    assert.equal(policy.rejectUnverifiableSpf, false);
    assert.equal(policy.rejectUnverifiableDkim, false);
  });

  it("should update organization security policies and persist values", async () => {
    await OrganizationService.updatePolicyConfig(testOrgId, {
      enforceTwoFactor: true,
      spamThresholdScore: 3.5,
      rejectUnverifiableSpf: true,
      rejectUnverifiableDkim: true,
    });

    const updatedPolicy = await OrganizationService.getPolicyConfig(testOrgId);
    assert.equal(updatedPolicy.enforceTwoFactor, true);
    assert.equal(updatedPolicy.spamThresholdScore, 3.5);
    assert.equal(updatedPolicy.rejectUnverifiableSpf, true);
    assert.equal(updatedPolicy.rejectUnverifiableDkim, true);
  });
});
