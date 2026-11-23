import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, AuthService } from "@cellsinbox/service";
import { CredentialModel } from "@cellsinbox/db";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) throw new Error("Unauthorized");

  const user = await UserService.getById(authUser.userId);
  if (!user) throw new Error("User not found.");

  const challenge = AuthService.getChallenge(`reg:${authUser.userId}`);
  if (!challenge) {
    throw new Error("Passkey registration challenge expired. Please retry.");
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

  const verification = await AuthService.verifyPasskeyRegistration(user, input.response, challenge, host);
  if (!verification.verified) {
    throw new Error("Passkey verification failed.");
  }

  if (input.name && input.response?.id) {
    await CredentialModel.updateOne(
      { credentialId: input.response.id },
      { $set: { name: input.name } },
    );
  }

  user.twoFactorEnforced = true;
  await user.save();

  return { success: true };
};
