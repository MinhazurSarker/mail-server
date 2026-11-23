import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser || (authUser.role !== "ORG_ADMIN" && authUser.role !== "PLATFORM_ADMIN")) {
    throw new Error("Unauthorized: Admin permissions required.");
  }

  const res = await OrganizationService.getBranding(authUser.organizationId);
  return {
    logoUrl: res.branding?.logoUrl,
    faviconUrl: res.branding?.faviconUrl,
    companyName: res.branding?.companyName,
    primaryColor: res.branding?.primaryColor,
    customWebmailDomains: res.customWebmailDomains || [],
  };
};
