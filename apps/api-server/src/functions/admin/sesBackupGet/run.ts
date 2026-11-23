import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel } from "@cellsinbox/db";
import { OrganizationService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) {
    throw new Error("Unauthorized: Session required.");
  }

  let org: any = null;
  if (input?.slug) {
    org = await OrganizationService.resolveOrg(input.slug);
    if (!org) throw new Error(`Organization '${input.slug}' not found.`);
    if (authUser.role !== "PLATFORM_ADMIN" && org._id.toString() !== authUser.organizationId) {
      throw new Error("Access denied to this organization.");
    }
  } else {
    org = await OrganizationModel.findById(authUser.organizationId);
  }

  const ses = org?.sesBackupConfig;

  return {
    enabled: !!ses?.enabled,
    region: ses?.region || "us-east-1",
    accessKeyId: ses?.accessKeyId ? `${ses.accessKeyId.slice(0, 4)}...` : undefined,
    fromEmail: ses?.fromEmail,
  };
};
