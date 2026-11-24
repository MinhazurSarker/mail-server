import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Verify and enroll a WebAuthn Passkey for the authenticated user",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  name: Type.Optional(Type.String()),
  challengeToken: Type.Optional(Type.String()),
  response: Type.Any(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
