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
  if (!authUser || (authUser.role !== "ORG_ADMIN" && authUser.role !== "PLATFORM_ADMIN")) {
    throw new Error("Unauthorized: Admin permissions required.");
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

  const res = await OrganizationService.getBranding(orgId);
  return {
    logoUrl: res.branding?.logoUrl,
    faviconUrl: res.branding?.faviconUrl,
    companyName: res.branding?.companyName,
    primaryColor: res.branding?.primaryColor,
    customWebmailDomains: res.customWebmailDomains || [],
  };
};
