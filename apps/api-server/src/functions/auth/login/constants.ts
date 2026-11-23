import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "User authentication endpoint",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  email: Type.String({ minLength: 3, description: "Account email address" }),
  password: Type.String({ minLength: 1, description: "Account password" }),
});

export const outputSchema = Type.Object({
  status: Type.Union([
    Type.Literal("AUTHENTICATED"),
    Type.Literal("REQUIRES_ONBOARDING"),
    Type.Literal("REQUIRES_2FA"),
  ]),
  userId: Type.String(),
  email: Type.String(),
  role: Type.String(),
  accessToken: Type.Optional(Type.String()),
  refreshToken: Type.Optional(Type.String()),
  requiresOnboarding: Type.Optional(Type.Boolean()),
  requiresTwoFactor: Type.Optional(Type.Boolean()),
  twoFactorMethods: Type.Optional(Type.Array(Type.String())),
});
