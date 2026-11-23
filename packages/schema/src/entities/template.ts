import { Type, type Static } from "@sinclair/typebox";

export const TemplateSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  userId: Type.String(),
  name: Type.String({ minLength: 1 }),
  subject: Type.String(),
  bodyHtml: Type.String(),
  bodyText: Type.String(),
  variables: Type.Array(Type.String()),
  description: Type.Optional(Type.String()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type Template = Static<typeof TemplateSchema>;

export const TemplateRecipientSchema = Type.Object({
  to: Type.String({ format: "email" }),
  variables: Type.Record(Type.String(), Type.String()),
});
export type TemplateRecipient = Static<typeof TemplateRecipientSchema>;
