import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Permanently delete an organization and all its data with step-up 2FA/passkey authentication",
  deprecated: false,
  tags: ["platform"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  organizationId: Type.String(),
  securityCode: Type.Optional(Type.String({ description: "6-digit TOTP code or administrator password" })),
  passkeyVerified: Type.Optional(Type.Boolean({ description: "True if authenticated via WebAuthn passkey assertion" })),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
  deletedSlug: Type.String(),
  deletedUsers: Type.Number(),
  deletedDomains: Type.Number(),
  deletedMessages: Type.Number(),
});
