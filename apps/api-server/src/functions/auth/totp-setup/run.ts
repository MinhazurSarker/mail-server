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
  // Enforce server-bound challenge token
  if (input.challengeToken) {
    const challengeHash = crypto.createHash("sha256").update(input.challengeToken.trim()).digest("hex");
    const challenge = await AuthChallengeModel.findOne({
      challengeHash,
      type: "FIRST_LOGIN_ONBOARDING",
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

  // Reject unbound user ID requests (R1 & onboarding compatibility)
  throw new Error("Onboarding requires an active login challenge. Please sign in with your credentials to start security setup.");
};
