import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get authenticated user profile from session context",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  token: Type.Optional(Type.String({ description: "Optional token if not passed in Authorization header" })),
});

export const outputSchema = Type.Object({
  userId: Type.String(),
  organizationId: Type.String(),
  domainId: Type.String(),
  email: Type.String(),
  displayName: Type.Optional(Type.String()),
  role: Type.String(),
  status: Type.String(),
  orgSlug: Type.Optional(Type.String()),
  orgName: Type.Optional(Type.String()),
  storageQuotaBytes: Type.Optional(Type.Number()),
  storageUsedBytes: Type.Optional(Type.Number()),
  maxSingleFileSizeBytes: Type.Optional(Type.Number()),
  maxAttachmentCount: Type.Optional(Type.Number()),
});
