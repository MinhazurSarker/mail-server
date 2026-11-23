import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  _context: MiddlewareContext,
): Promise<Output> => {
  return {
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };
};
