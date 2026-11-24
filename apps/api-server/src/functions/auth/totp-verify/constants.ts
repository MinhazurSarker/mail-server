import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Verify 6-digit TOTP challenge during login",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  userId: Type.String({ minLength: 1 }),
  code: Type.String({ minLength: 6, maxLength: 6 }),
});

export const outputSchema = Type.Object({
  status: Type.Literal("AUTHENTICATED"),
  userId: Type.String(),
  email: Type.String(),
  displayName: Type.Optional(Type.String()),
  role: Type.String(),
  accessToken: Type.String(),
  refreshToken: Type.String(),
});
