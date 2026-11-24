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
  const user = await AuthService.validatePassword(input.email, input.password);

  // Check if user requires mandatory 2FA onboarding (first login)
  if (user.status === "PENDING_SECURITY_SETUP") {
    const setup = AuthService.generateTotpSetup(user);
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "FIRST_LOGIN_ONBOARDING",
      factorsRequired: ["TOTP"],
      totpSecretPending: setup.secret,
    });

    return {
      status: "REQUIRES_ONBOARDING",
      challengeToken,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      requiresOnboarding: true,
      totpSecret: setup.secret,
      otpauthUri: setup.otpauthUri,
    };
  }

  // Check if user has enrolled 2FA authenticators
  const credentials = await AuthService.getUserCredentials(user._id.toString());
  const methods = credentials.map((c) => c.type.toLowerCase());

  if (methods.length > 0) {
    const { challengeToken } = await AuthService.createAuthChallenge({
      userId: user._id,
      type: "MFA_LOGIN",
      factorsRequired: methods,
    });

    return {
      status: "REQUIRES_2FA",
      challengeToken,
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      requiresTwoFactor: true,
      twoFactorMethods: methods,
    };
  }

  // If no 2FA required (fallback for accounts without MFA enforced), issue tokens directly
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
