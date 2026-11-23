import { Type, type Static } from "@sinclair/typebox";

export const CredentialTypeSchema = Type.Union([
  Type.Literal("PASSKEY"),
  Type.Literal("TOTP"),
  Type.Literal("RECOVERY_CODE"),
]);
export type CredentialType = Static<typeof CredentialTypeSchema>;

export const CredentialSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  type: CredentialTypeSchema,
  name: Type.Optional(Type.String({ description: "Device or key friendly name" })),
  credentialId: Type.Optional(Type.String({ description: "WebAuthn credential ID" })),
  publicKey: Type.Optional(Type.String({ description: "WebAuthn public key" })),
  counter: Type.Optional(Type.Number()),
  transports: Type.Optional(Type.Array(Type.String())),
  secret: Type.Optional(Type.String({ description: "Encrypted TOTP secret" })),
  createdAt: Type.String(),
  lastUsedAt: Type.Optional(Type.String()),
});
export type Credential = Static<typeof CredentialSchema>;
