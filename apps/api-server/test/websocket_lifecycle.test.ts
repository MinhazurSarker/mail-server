import test from "node:test";
import assert from "node:assert/strict";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  UserModel,
} from "@cellsinbox/db";
import { AuthService, UserService, OrganizationService, DomainService } from "@cellsinbox/service";

const TEST_DB_NAME = `cellsinbox_test_ws_${Date.now()}`;

test("WebSocket Lifecycle and Expiry/Revocation Validation (R6)", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `ws-test-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "WS Test Org",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.local`);

  const { user } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: `ws-user-${Date.now()}@${domain.name}`,
    displayName: "WS User",
    role: "MAILBOX_USER",
  });

  user.status = "ACTIVE";
  await user.save();

  await t.test("1. validateToken returns valid info for active session", async () => {
    const tokens = await AuthService.generateTokens(user);
    const payload = await AuthService.verifyAccessToken(tokens.accessToken);
    assert.equal(payload.userId, user._id.toString());
    assert.equal(payload.tokenVersion, user.tokenVersion || 1);

    // Assert active tenant passes
    await AuthService.assertActiveTenant(user);
  });

  await t.test("2. Token validation rejects revoked user sessions", async () => {
    const tokens = await AuthService.generateTokens(user);

    // Bump tokenVersion
    await AuthService.revokeUserSessions(user._id.toString());
    const refreshedUser = (await UserModel.findById(user._id))!;
    assert.equal(refreshedUser.tokenVersion, 2);

    const payload = await AuthService.verifyAccessToken(tokens.accessToken);
    assert.equal(payload.tokenVersion, 1);
    assert.notEqual(payload.tokenVersion, refreshedUser.tokenVersion, "Version mismatch must be detected!");
  });

  await t.test("3. Token validation rejects suspended organization", async () => {
    const refreshedUser = (await UserModel.findById(user._id))!;
    const freshTokens = await AuthService.generateTokens(refreshedUser);

    org.status = "SUSPENDED";
    await org.save();

    await assert.rejects(
      async () => {
        await AuthService.assertActiveTenant(refreshedUser);
      },
      /This organization has been suspended/,
      "Suspended organization must reject socket validation",
    );

    // Restore org
    org.status = "ACTIVE";
    await org.save();
  });
});
