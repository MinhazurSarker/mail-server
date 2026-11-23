import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Generate TOTP secret and QR code URI for onboarding",
  deprecated: false,
  tags: ["auth", "onboarding"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  userId: Type.String({ minLength: 1 }),
});

export const outputSchema = Type.Object({
  secret: Type.String(),
  otpauthUri: Type.String(),
});
