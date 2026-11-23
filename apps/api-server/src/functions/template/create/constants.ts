import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Create a new email template with variable placeholders {{var}}",
  deprecated: false,
  tags: ["template"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  subject: Type.String(),
  bodyHtml: Type.Optional(Type.String()),
  bodyText: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  subject: Type.String(),
  variables: Type.Array(Type.String()),
});
