import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Generate WebAuthn Passkey registration options for authenticated user",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Any();
