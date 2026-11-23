import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { ApiKeyService } from "@cellsinbox/service";
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

  const items = await ApiKeyService.listApiKeys({
    organizationId: authUser.organizationId,
    userId: authUser.userId,
  });

  return {
    items: items.map((k) => ({
      ...k,
      lastUsedAt: k.lastUsedAt?.toISOString(),
      expiresAt: k.expiresAt?.toISOString(),
      createdAt: k.createdAt.toISOString(),
    })),
  };
};
