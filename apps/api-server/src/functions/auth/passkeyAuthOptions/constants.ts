import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Generate WebAuthn Passkey authentication options for passwordless login",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  email: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  options: Type.Any(),
  challengeId: Type.String(),
});
