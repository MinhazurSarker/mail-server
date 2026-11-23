import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "List email templates for the organization",
  deprecated: false,
  tags: ["template"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      subject: Type.String(),
      bodyHtml: Type.String(),
      bodyText: Type.String(),
      variables: Type.Array(Type.String()),
      description: Type.Optional(Type.String()),
      createdAt: Type.String(),
      updatedAt: Type.String(),
    }),
  ),
});
