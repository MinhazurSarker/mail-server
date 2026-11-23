import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get user 2FA and security status including TOTP and enrolled passkeys",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  totpEnabled: Type.Boolean(),
  twoFactorEnforced: Type.Boolean(),
  passkeys: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      credentialId: Type.String(),
      createdAt: Type.String(),
      lastUsedAt: Type.Optional(Type.String()),
    }),
  ),
});
