import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "List contacts with optional search and favorite filter",
  deprecated: false,
  tags: ["contacts"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  search: Type.Optional(Type.String()),
  favoriteOnly: Type.Optional(Type.Boolean()),
  limit: Type.Optional(Type.Number()),
  skip: Type.Optional(Type.Number()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String(),
      phone: Type.Optional(Type.String()),
      company: Type.Optional(Type.String()),
      jobTitle: Type.Optional(Type.String()),
      notes: Type.Optional(Type.String()),
      isFavorite: Type.Boolean(),
      createdAt: Type.String(),
      updatedAt: Type.String(),
    }),
  ),
  total: Type.Number(),
});
