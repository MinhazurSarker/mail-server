import { Type, type Static } from "@sinclair/typebox";

export const ApiKeySchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
  name: Type.String({ minLength: 1, description: "Friendly key label" }),
  keyPrefix: Type.String({ description: "e.g. ci_live_abc123" }),
  allowedDomains: Type.Array(Type.String(), { description: "Allowed sender domains" }),
  rateLimitPerMinute: Type.Number({ default: 60 }),
  lastUsedAt: Type.Optional(Type.String()),
  expiresAt: Type.Optional(Type.String()),
  createdAt: Type.String(),
});
export type ApiKey = Static<typeof ApiKeySchema>;
