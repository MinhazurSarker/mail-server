import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Send autonomous templated emails programmatically with API Key or token",
  deprecated: false,
  tags: ["apiKey", "template"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  templateId: Type.String({ description: "Template ID or Template Name" }),
  recipients: Type.Array(
    Type.Object({
      to: Type.String({ minLength: 3 }),
      variables: Type.Record(Type.String(), Type.String()),
    }),
    { minItems: 1 },
  ),
});

export const outputSchema = Type.Object({
  total: Type.Number(),
  sent: Type.Number(),
  failed: Type.Number(),
  results: Type.Array(
    Type.Object({
      to: Type.String(),
      status: Type.String(),
      messageId: Type.Optional(Type.String()),
      error: Type.Optional(Type.String()),
    }),
  ),
});
