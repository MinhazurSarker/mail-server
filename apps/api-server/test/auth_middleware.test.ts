import test from "node:test";
import assert from "node:assert/strict";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  UserModel,
} from "@cellsinbox/db";
import { AuthService, UserService, OrganizationService, DomainService } from "@cellsinbox/service";
import { run as authMiddleware } from "../dist/middlewares/auth/run.js";

const TEST_DB_NAME = "cellsinbox_test_auth_middleware";

test("API Server Auth Middleware Hardening (F02, F05, R9)", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const orgSlug = `mw-org-${Date.now()}`;
  const org = await OrganizationService.createOrganization({
    name: "Middleware Test Org",
    slug: orgSlug,
  });
  org.status = "ACTIVE";
  await org.save();

  const domain = await DomainService.addDomain(org._id.toString(), `${orgSlug}.local`);

  const { user } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: `mw-user@${domain.name}`,
    displayName: "MW User",
    role: "MAILBOX_USER",
  });

  user.status = "ACTIVE";
  await user.save();

  const tokens = await AuthService.generateTokens(user);

  await t.test("1. Enforces authentication when token is missing", async () => {
    await assert.rejects(
      async () => {
        await authMiddleware(
          { options: {} } as any,
          { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
        );
      },
      /Authentication required/,
      "Missing token must be rejected",
    );
  });

  await t.test("2. Permits valid token with active user & org", async () => {
    const ctx = (await authMiddleware(
      {
        headers: { authorization: `Bearer ${tokens.accessToken}` },
        options: {},
      } as any,
      { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
    )) as { auth?: any };

    assert.ok(ctx.auth, "Auth context must be injected");
    assert.equal(ctx.auth?.userId, user._id.toString());
    assert.equal(ctx.auth?.role, "MAILBOX_USER");
    assert.equal(ctx.auth?.status, "ACTIVE");
  });

  await t.test("3. Enforces session revocation via tokenVersion mismatch (F05)", async () => {
    // Revoke sessions by bumping tokenVersion in DB
    await AuthService.revokeUserSessions(user._id.toString());

    await assert.rejects(
      async () => {
        await authMiddleware(
          {
            headers: { authorization: `Bearer ${tokens.accessToken}` },
            options: {},
          } as any,
          { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
        );
      },
      /Session has been revoked/,
      "Mismatched tokenVersion must be rejected with revoked error",
    );
  });

  await t.test("4. Enforces user suspension check", async () => {
    // Re-issue tokens with new tokenVersion
    const refreshedUser = await UserModel.findById(user._id);
    const freshTokens = await AuthService.generateTokens(refreshedUser!);

    // Suspend user
    refreshedUser!.status = "SUSPENDED";
    await refreshedUser!.save();

    await assert.rejects(
      async () => {
        await authMiddleware(
          {
            headers: { authorization: `Bearer ${freshTokens.accessToken}` },
            options: {},
          } as any,
          { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
        );
      },
      /Account is suspended/,
      "Suspended user must be denied",
    );

    // Reactivate user
    refreshedUser!.status = "ACTIVE";
    await refreshedUser!.save();
  });

  await t.test("5. Enforces organization suspension check (R9)", async () => {
    const refreshedUser = await UserModel.findById(user._id);
    const freshTokens = await AuthService.generateTokens(refreshedUser!);

    // Suspend org
    org.status = "SUSPENDED";
    await org.save();

    await assert.rejects(
      async () => {
        await authMiddleware(
          {
            headers: { authorization: `Bearer ${freshTokens.accessToken}` },
            options: {},
          } as any,
          { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
        );
      },
      /This organization has been suspended/,
      "User in suspended organization must be denied",
    );

    // Restore org
    org.status = "ACTIVE";
    await org.save();
  });

  await t.test("6. Enforces organization pending approval check (R9)", async () => {
    const refreshedUser = await UserModel.findById(user._id);
    const freshTokens = await AuthService.generateTokens(refreshedUser!);

    org.status = "PENDING_APPROVAL";
    await org.save();

    await assert.rejects(
      async () => {
        await authMiddleware(
          {
            headers: { authorization: `Bearer ${freshTokens.accessToken}` },
            options: {},
          } as any,
          { headers: {}, ip: "127.0.0.1", namespace: "mail", functionName: "list" } as any,
        );
      },
      /pending approval/,
      "User in pending-approval organization must be denied",
    );

    // Restore org
    org.status = "ACTIVE";
    await org.save();
  });

  // Drop isolated test DB and disconnect
  await cleanupTestDatabase();
});
