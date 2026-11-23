/**
 * middlewares/auth/constants.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth middleware metadata and schemas.
 */

import { Type, type Static } from "@sinclair/typebox";

export const UserRoleSchema = Type.Union([
  Type.Literal("PLATFORM_ADMIN"),
  Type.Literal("ORG_ADMIN"),
  Type.Literal("MAILBOX_USER"),
]);
export type UserRole = Static<typeof UserRoleSchema>;

export const metadata = {
  name: "auth",
  description: "Validates JWT bearer token or SendGrid-style API key and injects auth claims into context",
};

export const headersSchema = Type.Object({
  authorization: Type.Optional(Type.String()),
  token: Type.Optional(Type.String()),
  "x-api-key": Type.Optional(Type.String()),
});

export const inputSchema = Type.Object({});

export const AuthContextSchema = Type.Object({
  userId: Type.String(),
  organizationId: Type.String(),
  domainId: Type.Optional(Type.String()),
  email: Type.String(),
  role: UserRoleSchema,
  status: Type.String(),
  isApiKey: Type.Boolean(),
  apiKeyId: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  auth: AuthContextSchema,
});
