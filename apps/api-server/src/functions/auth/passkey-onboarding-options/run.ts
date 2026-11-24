import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { AuthService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext,
): Promise<Output> => {
  const headers = (context.headers || {}) as Record<string, string | undefined>;
  const host = headers["x-forwarded-host"] || headers["host"] || undefined;

  const result = await AuthService.generateOnboardingPasskeyOptions(
    input.challengeToken,
    host,
  );

  return { options: result.options };
};
