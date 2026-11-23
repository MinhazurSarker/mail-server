import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Verify WebAuthn Passkey assertion and log user in",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  challengeId: Type.String(),
  response: Type.Any(),
});

export const outputSchema = Type.Object({
  status: Type.Literal("AUTHENTICATED"),
  userId: Type.String(),
  email: Type.String(),
  role: Type.String(),
  accessToken: Type.String(),
  refreshToken: Type.String(),
});
