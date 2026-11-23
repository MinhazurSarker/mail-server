import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Update organization security and spam policy",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
  enforceTwoFactor: Type.Optional(Type.Boolean()),
  spamThresholdScore: Type.Optional(Type.Number()),
  rejectUnverifiableSpf: Type.Optional(Type.Boolean()),
  rejectUnverifiableDkim: Type.Optional(Type.Boolean()),
  maxSingleFileSizeBytes: Type.Optional(Type.Number()),
  maxAttachmentCount: Type.Optional(Type.Number()),
  defaultUserStorageBytes: Type.Optional(Type.Number()),
  maxStorageBytes: Type.Optional(Type.Number()),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
