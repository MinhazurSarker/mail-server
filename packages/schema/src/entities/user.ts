import { Type, type Static } from "@sinclair/typebox";

export const UserRoleSchema = Type.Union([
  Type.Literal("PLATFORM_ADMIN"),
  Type.Literal("ORG_ADMIN"),
  Type.Literal("MAILBOX_USER"),
]);
export type UserRole = Static<typeof UserRoleSchema>;

export const UserStatusSchema = Type.Union([
  Type.Literal("PENDING_SECURITY_SETUP"),
  Type.Literal("ACTIVE"),
  Type.Literal("LOCKED"),
  Type.Literal("SUSPENDED"),
]);
export type UserStatus = Static<typeof UserStatusSchema>;

export const UserSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  domainId: Type.String(),
  email: Type.String({ minLength: 3 }),
  displayName: Type.Optional(Type.String()),
  role: UserRoleSchema,
  status: UserStatusSchema,
  hasApiPermission: Type.Boolean({ default: false }),
  twoFactorEnforced: Type.Boolean({ default: true }),
  storageQuotaBytes: Type.Number({ default: 10737418240 }), // 10GB default
  storageUsedBytes: Type.Number({ default: 0 }),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type User = Static<typeof UserSchema>;
