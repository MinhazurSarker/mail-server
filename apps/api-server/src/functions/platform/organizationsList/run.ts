import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { OrganizationModel, DomainModel, UserModel } from "@cellsinbox/db";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser || authUser.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized: Platform Admin privilege required.");
  }

  const filter: Record<string, any> = {};
  if (input?.status) {
    filter.status = input.status;
  }

  const orgs = await OrganizationModel.find(filter).sort({ createdAt: -1 });

  const items = await Promise.all(
    orgs.map(async (org) => {
      const [domains, usersCount] = await Promise.all([
        DomainModel.find({ organizationId: org._id }),
        UserModel.countDocuments({ organizationId: org._id }),
      ]);
      const primaryDomain = domains.length > 0 ? domains[0].name : "None registered";

      return {
        id: org._id.toString(),
        name: org.name,
        slug: org.slug,
        status: org.status,
        primaryDomain,
        usersCount,
        domainsCount: domains.length,
        maxStorageBytes: org.maxStorageBytes || 107374182400,
        createdAt: org.createdAt.toISOString(),
      };
    }),
  );

  return {
    items,
    total: items.length,
  };
};
