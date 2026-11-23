import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { ApiKeyService } from "@cellsinbox/service";
import { ApiKeyModel } from "@cellsinbox/db";
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
    throw new Error("Unauthorized: API Key or Authenticated session required.");
  }

  // 1. If caller authenticated with an API key, load the underlying IApiKey document
  let apiKeyDoc: any = authUser.apiKeyId
    ? await ApiKeyModel.findById(authUser.apiKeyId)
    : null;

  // 2. If caller is an authenticated web session, find or construct an authorized virtual key
  if (!apiKeyDoc) {
    // Find first active API key for this user/org or create a virtual session key
    apiKeyDoc = await ApiKeyModel.findOne({
      organizationId: authUser.organizationId,
      userId: authUser.userId,
    });

    if (!apiKeyDoc) {
      // Create a default session key allowing all verified domains of this organization
      const { apiKey } = await ApiKeyService.createApiKey({
        organizationId: authUser.organizationId,
        userId: authUser.userId,
        name: "Webmail Session Sender",
        allowedDomains: ["*"],
        rateLimitPerMinute: 120,
      });
      apiKeyDoc = apiKey;
    }
  }

  if (!apiKeyDoc) {
    throw new Error("Could not find or generate active API key for sending.");
  }

  const result = await ApiKeyService.sendProgrammaticEmail({
    apiKey: apiKeyDoc as any,
    from: input.from,
    fromName: input.fromName,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });

  return result;
};
