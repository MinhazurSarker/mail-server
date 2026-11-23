import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { StorageService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser || (authUser.role !== "ORG_ADMIN" && authUser.role !== "PLATFORM_ADMIN")) {
    throw new Error("Unauthorized: Admin permissions required.");
  }

  const start = Date.now();
  try {
    const success = await StorageService.testConnection({
      provider: input.provider,
      endpoint: input.endpoint || "",
      bucket: input.bucket || "",
      region: input.region || "auto",
      accessKeyId: input.accessKeyId || "",
      secretAccessKey: input.secretAccessKey || "",
    });

    const latencyMs = Date.now() - start;
    if (success) {
      return {
        success: true,
        message: `Successfully connected to ${input.provider === "cloudflare_r2" ? "Cloudflare R2" : input.provider} bucket '${input.bucket || "local"}'!`,
        latencyMs,
      };
    } else {
      return {
        success: false,
        message: `Failed to connect to ${input.provider} bucket '${input.bucket}'. Check bucket name and credentials.`,
        latencyMs,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      message: err.message || "Failed to reach storage provider.",
      latencyMs,
    };
  }
};
