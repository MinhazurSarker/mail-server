import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get organization security and spam policy",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  enforceTwoFactor: Type.Boolean(),
  spamThresholdScore: Type.Number(),
  rejectUnverifiableSpf: Type.Boolean(),
  rejectUnverifiableDkim: Type.Boolean(),
  maxSingleFileSizeBytes: Type.Number(),
  maxAttachmentCount: Type.Number(),
  defaultUserStorageBytes: Type.Number(),
  maxStorageBytes: Type.Number(),
});
