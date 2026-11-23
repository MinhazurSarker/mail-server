import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { TemplateService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) throw new Error("Unauthorized: Authentication required.");

  const success = await TemplateService.deleteTemplate(input.id, authUser.organizationId);
  return { success };
};
