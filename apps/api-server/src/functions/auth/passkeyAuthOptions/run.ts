import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import crypto from "node:crypto";
import { UserService, AuthService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext,
): Promise<Output> => {
  let user = null;
  if (input.email) {
    user = await UserService.getByEmail(input.email);
  }

  const headers = context.headers || (context as any).req?.headers || {};
  const hostHeader = (
    headers["x-forwarded-host"] ||
    headers["x-original-host"] ||
    headers["origin"] ||
    headers["referer"] ||
    headers["host"]
  ) as string | undefined;

  let host: string | undefined = undefined;
  if (hostHeader) {
    if (hostHeader.startsWith("http://") || hostHeader.startsWith("https://")) {
      try {
        host = new URL(hostHeader).host;
      } catch {}
    } else {
      host = hostHeader.split(",")[0].trim();
    }
  }

  const options = await AuthService.generatePasskeyAuthenticationOptions(user || undefined, host);
  const challengeId = crypto.randomUUID();
  AuthService.setChallenge(`auth:${challengeId}`, options.challenge);

  return {
    options,
    challengeId,
  };
};
