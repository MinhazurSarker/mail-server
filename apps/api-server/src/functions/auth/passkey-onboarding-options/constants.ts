import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Generate WebAuthn registration options for first-login onboarding",
  deprecated: false,
  tags: ["auth", "onboarding", "passkey"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  challengeToken: Type.String({ description: "Onboarding challenge token" }),
});

export const outputSchema = Type.Object({
  options: Type.Any({ description: "PublicKeyCredentialCreationOptions" }),
});
