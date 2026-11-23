import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, AuthService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<any> => {
  const authUser = context.auth;
  if (!authUser) throw new Error("Unauthorized");

  const user = await UserService.getById(authUser.userId);
  if (!user) throw new Error("User not found.");

  const host = (context.req?.headers?.host as string) || undefined;
  const options = await AuthService.generatePasskeyRegistrationOptions(user, host);
  AuthService.setChallenge(`reg:${authUser.userId}`, options.challenge);
  return options;
};
