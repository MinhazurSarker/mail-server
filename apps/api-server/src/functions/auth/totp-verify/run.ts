import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, AuthService } from "@cellsinbox/service";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  const user = await UserService.getById(input.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const isValid = await AuthService.verifyTotpCode(input.userId, input.code);
  if (!isValid) {
    throw new Error("Invalid TOTP verification code.");
  }

  const tokens = await AuthService.generateTokens(user);

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
