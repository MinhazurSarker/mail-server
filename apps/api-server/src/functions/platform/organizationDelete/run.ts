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

  return await OrganizationService.deleteOrganization({
    organizationId: input.organizationId,
    adminUserId: authUser.userId,
    securityCode: input.securityCode,
    passkeyVerified: input.passkeyVerified,
  });
};
