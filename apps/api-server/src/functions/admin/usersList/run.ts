import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, OrganizationService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) {
    throw new Error("Unauthorized: Session required.");
  }

  let orgId = authUser.organizationId;
  if (input?.slug) {
    const org = await OrganizationService.resolveOrg(input.slug);
    if (!org) throw new Error(`Organization '${input.slug}' not found.`);
    if (authUser.role !== "PLATFORM_ADMIN" && org._id.toString() !== authUser.organizationId) {
      throw new Error("Access denied to this organization.");
    }
    orgId = org._id.toString();
  }

  const users = await UserService.listByOrganization(orgId);

  return {
    items: users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      status: u.status,
      twoFactorEnforced: u.twoFactorEnforced,
      storageQuotaBytes: u.storageQuotaBytes,
      storageUsedBytes: u.storageUsedBytes,
      createdAt: u.createdAt.toISOString(),
    })),
  };
};
