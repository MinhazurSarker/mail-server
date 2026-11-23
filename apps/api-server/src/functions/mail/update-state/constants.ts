import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  id: Type.Optional(Type.String()),
  messageId: Type.Optional(Type.String()),
  folder: Type.Optional(Type.String()),
  isRead: Type.Optional(Type.Boolean()),
  isStarred: Type.Optional(Type.Boolean()),
  labels: Type.Optional(Type.Array(Type.String())),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
