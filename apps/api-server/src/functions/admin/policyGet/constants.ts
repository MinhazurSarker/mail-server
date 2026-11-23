import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get organization security and spam policy",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  enforceTwoFactor: Type.Boolean(),
  spamThresholdScore: Type.Number(),
  rejectUnverifiableSpf: Type.Boolean(),
  rejectUnverifiableDkim: Type.Boolean(),
});
