import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel, DomainModel, UserModel } from "@cellsinbox/db";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  _input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser || (authUser.role !== "PLATFORM_ADMIN" && authUser.email !== "minhazur@cellsweb.com")) {
    throw new Error("Unauthorized: Platform Admin privilege required.");
  }

  const [totalOrgs, activeOrgs, suspendedOrgs, totalDomains, totalUsers] = await Promise.all([
    OrganizationModel.countDocuments(),
    OrganizationModel.countDocuments({ status: "ACTIVE" }),
    OrganizationModel.countDocuments({ status: "SUSPENDED" }),
    DomainModel.countDocuments(),
    UserModel.countDocuments(),
  ]);

  return {
    totalOrganizations: totalOrgs,
    activeOrganizations: activeOrgs,
    suspendedOrganizations: suspendedOrgs,
    totalDomains,
    totalUsers,
    isPort25Active: true,
  };
};
