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

  await OrganizationService.updateBranding(
    authUser.organizationId,
    {
      logoUrl: input.logoUrl,
      faviconUrl: input.faviconUrl,
      companyName: input.companyName,
      primaryColor: input.primaryColor,
    },
    input.customWebmailDomains,
  );

  return { success: true };
};
