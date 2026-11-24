import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { AuthService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  const result = await AuthService.completeFirstLoginSecuritySetup({
    challengeToken: input.challengeToken,
    newPassword: input.newPassword,
    totpToken: input.totpToken,
    passkeyResponse: input.passkeyResponse,
    passkeyCredential: input.passkeyCredential as any,
  });

  return {
    status: "ACTIVE",
    userId: result.user._id.toString(),
    email: result.user.email,
    role: result.user.role,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  };
};
