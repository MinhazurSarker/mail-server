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

  const host = (context.req?.headers?.host as string) || undefined;
  const options = await AuthService.generatePasskeyAuthenticationOptions(user || undefined, host);
  const challengeId = crypto.randomUUID();
  AuthService.setChallenge(`auth:${challengeId}`, options.challenge);

  return {
    options,
    challengeId,
  };
};
