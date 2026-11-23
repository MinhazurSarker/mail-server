import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { ApiKeyService } from "@cellsinbox/service";
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

  const result = await ApiKeyService.createApiKey({
    organizationId: authUser.organizationId,
    userId: authUser.userId,
    name: input.name,
    allowedDomains: input.allowedDomains,
    rateLimitPerMinute: input.rateLimitPerMinute,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
  });

  return {
    apiKey: {
      id: result.apiKey._id.toString(),
      name: result.apiKey.name,
      keyPrefix: `${result.apiKey.keyPrefix}...`,
      allowedDomains: result.apiKey.allowedDomains,
      rateLimitPerMinute: result.apiKey.rateLimitPerMinute,
    },
    rawSecretKey: result.rawSecretKey,
  };
};
