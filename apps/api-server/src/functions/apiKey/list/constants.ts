import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      keyPrefix: Type.String(),
      allowedDomains: Type.Array(Type.String()),
      rateLimitPerMinute: Type.Number(),
      lastUsedAt: Type.Optional(Type.String()),
      expiresAt: Type.Optional(Type.String()),
      createdAt: Type.String(),
    }),
  ),
});
