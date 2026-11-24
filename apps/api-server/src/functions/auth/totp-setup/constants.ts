import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Generate TOTP secret and QR code URI for onboarding",
  deprecated: false,
  tags: ["auth", "onboarding"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  challengeToken: Type.Optional(Type.String({ description: "Onboarding challenge token" })),
  userId: Type.Optional(Type.String({ description: "User ID for first-login setup" })),
});

export const outputSchema = Type.Object({
  secret: Type.String(),
  otpauthUri: Type.String(),
});
