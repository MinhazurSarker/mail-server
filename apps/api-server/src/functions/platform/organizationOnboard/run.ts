import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser || (authUser.role !== "PLATFORM_ADMIN" && authUser.email !== "minhazur@cellsweb.com")) {
    throw new Error("Unauthorized: Platform Admin privilege required.");
  }

  const result = await OrganizationService.onboardOrganization({
    name: input.name,
    slug: input.slug,
    domainName: input.domainName,
    adminEmail: input.adminEmail,
    adminPassword: input.adminPassword,
    adminDisplayName: input.adminDisplayName,
  });

  return {
    organizationId: result.organization._id.toString(),
    slug: result.organization.slug,
    adminEmail: result.email,
    dnsRecords: result.dnsRecords,
  };
};
