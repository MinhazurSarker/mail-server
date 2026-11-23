import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { DomainService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) {
    throw new Error("Unauthorized: Session required.");
  }

  const domains = await DomainService.listByOrganization(authUser.organizationId);

  return {
    items: domains.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      isVerified: d.isVerified,
      verificationToken: d.verificationToken,
      dkimSelector: d.dkimSelector,
      dkimPublicKey: d.dkimPublicKey,
      spfStatus: d.spfStatus,
      dkimStatus: d.dkimStatus,
      dmarcStatus: d.dmarcStatus,
      mxStatus: d.mxStatus,
      createdAt: d.createdAt.toISOString(),
    })),
  };
};
