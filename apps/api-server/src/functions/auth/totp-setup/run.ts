import crypto from "node:crypto";
import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { UserService, AuthService } from "@cellsinbox/service";
import { AuthChallengeModel } from "@cellsinbox/db";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  // 1. If challengeToken is provided, retrieve pending secret bound to challenge
  if (input.challengeToken) {
    const challengeHash = crypto.createHash("sha256").update(input.challengeToken.trim()).digest("hex");
    const challenge = await AuthChallengeModel.findOne({
      challengeHash,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).select("+totpSecretPending");

    if (challenge && challenge.totpSecretPending && challenge.userId) {
      const user = await UserService.getById(challenge.userId.toString());
      if (user) {
        const setup = AuthService.generateTotpSetup(user);
        return {
          secret: challenge.totpSecretPending,
          otpauthUri: setup.otpauthUri.replace(/secret=[^&]+/, `secret=${challenge.totpSecretPending}`),
        };
      }
    }
  }

  // 2. Fallback to userId if user is pending setup
  if (input.userId) {
    const user = await UserService.getById(input.userId);
    if (user && user.status === "PENDING_SECURITY_SETUP") {
      const setup = AuthService.generateTotpSetup(user);
      return {
        secret: setup.secret,
        otpauthUri: setup.otpauthUri,
      };
    }
  }

  throw new Error("Invalid or expired onboarding session. Please sign in again.");
};
