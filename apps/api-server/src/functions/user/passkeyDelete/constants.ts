import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Delete a registered WebAuthn Passkey",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  credentialId: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
