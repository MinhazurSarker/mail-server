import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { DomainService, OrganizationService } from "@cellsinbox/service";
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

  let orgId = authUser.organizationId;
  if (input?.slug) {
    const org = await OrganizationService.resolveOrg(input.slug);
    if (!org) throw new Error(`Organization '${input.slug}' not found.`);
    if (authUser.role !== "PLATFORM_ADMIN" && org._id.toString() !== authUser.organizationId) {
      throw new Error("Access denied to this organization.");
    }
    orgId = org._id.toString();
  }

  const domains = await DomainService.listByOrganization(orgId);

  return {
    items: domains.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      isVerified: d.isVerified,
      verificationToken: d.verificationToken,
      dkimSelector: d.dkimSelector,
      dkimPublicKey: d.dkimPublicKey,
      spfStatus: d.spfStatus,
      dkimStatus: d.dkimStatus,
      dmarcStatus: d.dmarcStatus,
      mxStatus: d.mxStatus,
      createdAt: d.createdAt.toISOString(),
    })),
  };
};
