import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      email: Type.String(),
      displayName: Type.Optional(Type.String()),
      role: Type.String(),
      status: Type.String(),
      twoFactorEnforced: Type.Boolean(),
      createdAt: Type.String(),
    }),
  ),
});
