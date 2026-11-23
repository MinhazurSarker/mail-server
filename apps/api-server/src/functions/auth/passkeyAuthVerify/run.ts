import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, AuthService } from "@cellsinbox/service";
import { CredentialModel } from "@cellsinbox/db";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  const challenge = AuthService.getChallenge(`auth:${input.challengeId}`);
  if (!challenge) {
    throw new Error("Authentication challenge expired or invalid. Please retry.");
  }

  const cred = await CredentialModel.findOne({
    credentialId: input.response?.id,
    type: "PASSKEY",
  });
  if (!cred) {
    throw new Error("No matching Passkey found for this device.");
  }

  const user = await UserService.getById(cred.userId.toString());
  if (!user) {
    throw new Error("User associated with this Passkey not found.");
  }

  const verification = await AuthService.verifyPasskeyAuthentication(user, input.response, challenge);
  if (!verification.verified) {
    throw new Error("Passkey authentication failed.");
  }

  const tokens = await AuthService.generateTokens(user);

  return {
    status: "AUTHENTICATED",
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};
