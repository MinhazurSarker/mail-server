import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Update organization security and spam policy",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  enforceTwoFactor: Type.Optional(Type.Boolean()),
  spamThresholdScore: Type.Optional(Type.Number()),
  rejectUnverifiableSpf: Type.Optional(Type.Boolean()),
  rejectUnverifiableDkim: Type.Optional(Type.Boolean()),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
