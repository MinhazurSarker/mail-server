import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { AuthService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

function extractHost(context: MiddlewareContext): string | undefined {
  const headers = context.headers || (context as any).req?.headers || {};
  const hostHeader = (
    headers["x-forwarded-host"] ||
    headers["x-original-host"] ||
    headers["origin"] ||
    headers["referer"] ||
    headers["host"]
  ) as string | undefined;

  if (!hostHeader) return undefined;
  if (hostHeader.startsWith("http://") || hostHeader.startsWith("https://")) {
    try {
      return new URL(hostHeader).host;
    } catch {
      return undefined;
    }
  }
  return hostHeader.split(",")[0].trim();
}

export const run = async (
  input: Input,
  context: MiddlewareContext,
): Promise<Output> => {
  const host = extractHost(context);
  const { user, tokens } = await AuthService.verifyPasskeyAuthentication(
    input.response,
    input.challengeId,
    host,
  );

  return {
    status: "AUTHENTICATED",
    userId: user._id.toString(),
    email: user.email,
    displayName: user.displayName || user.email.split("@")[0],
    role: user.role,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};
