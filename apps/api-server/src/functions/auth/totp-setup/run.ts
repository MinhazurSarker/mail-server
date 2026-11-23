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

  const setup = AuthService.generateTotpSetup(user);
  return {
    secret: setup.secret,
    otpauthUri: setup.otpauthUri,
  };
};
