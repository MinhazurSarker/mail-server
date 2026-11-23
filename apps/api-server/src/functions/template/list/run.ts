import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { TemplateService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) throw new Error("Unauthorized: Authentication required.");

  const templates = await TemplateService.listTemplates(authUser.organizationId);

  return {
    items: templates.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      subject: t.subject,
      bodyHtml: t.bodyHtml || "",
      bodyText: t.bodyText || "",
      variables: t.variables || [],
      description: t.description,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };
};
