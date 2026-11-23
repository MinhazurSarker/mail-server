import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Autocomplete search contacts by name or email",
  deprecated: false,
  tags: ["contacts"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  query: Type.String(),
  limit: Type.Optional(Type.Number()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String(),
      company: Type.Optional(Type.String()),
    }),
  ),
});
