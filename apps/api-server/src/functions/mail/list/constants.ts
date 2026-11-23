import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  folder: Type.Optional(Type.String({ default: "INBOX" })),
  page: Type.Optional(Type.Number({ default: 1 })),
  limit: Type.Optional(Type.Number({ default: 30 })),
  isStarred: Type.Optional(Type.Boolean()),
  isRead: Type.Optional(Type.Boolean()),
  search: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      messageId: Type.String(),
      folder: Type.String(),
      isRead: Type.Boolean(),
      isStarred: Type.Boolean(),
      subject: Type.String(),
      from: Type.Object({
        name: Type.Optional(Type.String()),
        address: Type.String(),
      }),
      to: Type.Array(
        Type.Object({
          name: Type.Optional(Type.String()),
          address: Type.String(),
        }),
      ),
      date: Type.Union([Type.String(), Type.Date()]),
      hasAttachments: Type.Boolean(),
      sizeBytes: Type.Number(),
      snippet: Type.String(),
      labels: Type.Optional(Type.Array(Type.String())),
    }),
  ),
  total: Type.Number(),
  unreadCount: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
});
