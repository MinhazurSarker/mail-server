import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      email: Type.String(),
      displayName: Type.Optional(Type.String()),
      role: Type.String(),
      status: Type.String(),
      twoFactorEnforced: Type.Boolean(),
      storageQuotaBytes: Type.Optional(Type.Number()),
      storageUsedBytes: Type.Optional(Type.Number()),
      createdAt: Type.String(),
    }),
  ),
});
