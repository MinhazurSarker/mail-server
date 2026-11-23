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

  const template = await TemplateService.createTemplate({
    organizationId: authUser.organizationId,
    userId: authUser.userId,
    name: input.name,
    subject: input.subject,
    bodyHtml: input.bodyHtml,
    bodyText: input.bodyText,
    description: input.description,
  });

  return {
    id: template._id.toString(),
    name: template.name,
    subject: template.subject,
    variables: template.variables,
  };
};
