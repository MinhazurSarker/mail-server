import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Complete mandatory first-login security onboarding",
  deprecated: false,
  tags: ["auth", "onboarding"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  userId: Type.String({ minLength: 1 }),
  newPassword: Type.Optional(Type.String({ minLength: 8 })),
  totpSecret: Type.Optional(Type.String()),
  totpToken: Type.Optional(Type.String({ minLength: 6, maxLength: 6 })),
  passkeyCredential: Type.Optional(
    Type.Object({
      credentialId: Type.String(),
      publicKey: Type.String(),
      counter: Type.Number(),
    }),
  ),
});

export const outputSchema = Type.Object({
  status: Type.Literal("ACTIVE"),
  userId: Type.String(),
  email: Type.String(),
  role: Type.String(),
  accessToken: Type.String(),
  refreshToken: Type.String(),
});
