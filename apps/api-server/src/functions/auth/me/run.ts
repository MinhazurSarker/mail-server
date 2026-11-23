import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel, UserModel } from "@cellsinbox/db";
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
    throw new Error("Unauthorized: No authenticated user session found in context.");
  }

  const [org, user] = await Promise.all([
    OrganizationModel.findById(authUser.organizationId),
    UserModel.findById(authUser.userId),
  ]);

  return {
    userId: authUser.userId,
    organizationId: authUser.organizationId,
    domainId: authUser.domainId || "",
    email: authUser.email,
    displayName: user?.displayName || authUser.email.split("@")[0],
    role: authUser.role,
    status: authUser.status,
    orgSlug: org?.slug || "",
    orgName: org?.name || "CellsInbox",
    storageQuotaBytes: user?.storageQuotaBytes ?? 10737418240,
    storageUsedBytes: user?.storageUsedBytes ?? 0,
    maxSingleFileSizeBytes: org?.policyConfig?.maxSingleFileSizeBytes ?? 26214400,
    maxAttachmentCount: org?.policyConfig?.maxAttachmentCount ?? 10,
  };
};
