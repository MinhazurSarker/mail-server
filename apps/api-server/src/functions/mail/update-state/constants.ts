import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  messageId: Type.String(),
  folder: Type.Optional(Type.String()),
  isRead: Type.Optional(Type.Boolean()),
  isStarred: Type.Optional(Type.Boolean()),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
