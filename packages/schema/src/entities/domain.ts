import { Type, type Static } from "@sinclair/typebox";

export const DomainStatusSchema = Type.Union([
  Type.Literal("PENDING"),
  Type.Literal("VERIFIED"),
  Type.Literal("FAILED"),
]);
export type DomainStatus = Static<typeof DomainStatusSchema>;

export const DomainSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  name: Type.String({ minLength: 3, description: "Domain name (e.g. example.com)" }),
  isVerified: Type.Boolean({ default: false }),
  verificationToken: Type.String(),
  dkimSelector: Type.String({ default: "ci" }),
  dkimPublicKey: Type.String(),
  spfStatus: DomainStatusSchema,
  dkimStatus: DomainStatusSchema,
  dmarcStatus: DomainStatusSchema,
  mxStatus: DomainStatusSchema,
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type Domain = Static<typeof DomainSchema>;
