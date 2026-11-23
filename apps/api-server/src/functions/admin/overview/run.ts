import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel, DomainModel, UserModel, ApiKeyModel } from "@cellsinbox/db";
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
  if (!org) {
    throw new Error("Organization not found.");
  }

  const [domainsCount, usersCount, apiKeysCount] = await Promise.all([
    DomainModel.countDocuments({ organizationId: org._id }),
    UserModel.countDocuments({ organizationId: org._id }),
    ApiKeyModel.countDocuments({ organizationId: org._id }),
  ]);

  return {
    organizationName: org.name,
    domainsCount,
    usersCount,
    apiKeysCount,
    storageProvider: org.storageConfig?.provider || "local_fallback",
    sesBackupEnabled: !!org.sesBackupConfig?.enabled,
    isPrimaryPort25Active: true,
  };
};
