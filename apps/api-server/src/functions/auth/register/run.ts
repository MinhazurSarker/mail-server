import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  const result = await OrganizationService.onboardOrganization({
    name: input.orgName,
    slug: input.slug,
    domainName: input.domainName,
    adminEmail: input.adminEmail,
    adminPassword: input.adminPassword,
    adminDisplayName: input.adminDisplayName,
    storageConfig: input.storageConfig,
  });

  return {
    userId: result.userId,
    email: result.email,
    orgId: result.organization._id.toString(),
    orgName: result.organization.name,
    domainId: result.domain._id.toString(),
    domainName: result.domain.name,
    requiresOnboarding: true,
    dnsRecords: result.dnsRecords,
  };
};
