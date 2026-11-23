import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel } from "@cellsinbox/db";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) {
    throw new Error("Unauthorized: Session required.");
  }

  const org = await OrganizationModel.findById(authUser.organizationId);
  const cfg = org?.storageConfig;

  return {
    provider: cfg?.provider || "local_fallback",
    endpoint: cfg?.endpoint,
    bucket: cfg?.bucket,
    region: cfg?.region,
    accessKeyId: cfg?.accessKeyId ? `${cfg.accessKeyId.slice(0, 4)}...` : undefined,
  };
};
