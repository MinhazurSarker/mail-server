import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { DomainService } from "@cellsinbox/service";
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

  const domain = await DomainService.addDomain(authUser.organizationId, input.name);

  return {
    domain: {
      id: domain._id.toString(),
      name: domain.name,
      verificationToken: domain.verificationToken,
      dkimSelector: domain.dkimSelector,
      dkimPublicKey: domain.dkimPublicKey,
    },
  };
};
