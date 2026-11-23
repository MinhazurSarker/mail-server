import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Create a new contact",
  deprecated: false,
  tags: ["contacts"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ minLength: 3 }),
  phone: Type.Optional(Type.String()),
  company: Type.Optional(Type.String()),
  jobTitle: Type.Optional(Type.String()),
  notes: Type.Optional(Type.String()),
  isFavorite: Type.Optional(Type.Boolean()),
});

export const outputSchema = Type.Object({
  contact: Type.Object({
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
});
