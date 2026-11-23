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

  const options = await AuthService.generatePasskeyRegistrationOptions(user, host);
  AuthService.setChallenge(`reg:${authUser.userId}`, options.challenge);
  return options;
};
