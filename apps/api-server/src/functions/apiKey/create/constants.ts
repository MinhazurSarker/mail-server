import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  allowedDomains: Type.Array(Type.String()),
  rateLimitPerMinute: Type.Optional(Type.Number({ default: 60 })),
  expiresAt: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  apiKey: Type.Object({
    id: Type.String(),
    name: Type.String(),
    keyPrefix: Type.String(),
    allowedDomains: Type.Array(Type.String()),
    rateLimitPerMinute: Type.Number(),
  }),
  rawSecretKey: Type.String(),
});
