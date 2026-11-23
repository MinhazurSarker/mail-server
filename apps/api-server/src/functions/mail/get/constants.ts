import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  messageId: Type.String(),
  markAsRead: Type.Optional(Type.Boolean({ default: true })),
});

export const outputSchema = Type.Object({
  id: Type.String(),
  mailboxStateId: Type.String(),
  folder: Type.String(),
  isRead: Type.Boolean(),
  isStarred: Type.Boolean(),
  messageId: Type.String(),
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
  cc: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.Optional(Type.String()),
        address: Type.String(),
      }),
    ),
  ),
  bcc: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.Optional(Type.String()),
        address: Type.String(),
      }),
    ),
  ),
  spfResult: Type.Optional(Type.String()),
  dkimResult: Type.Optional(Type.String()),
  dmarcResult: Type.Optional(Type.String()),
  subject: Type.String(),
  date: Type.Union([Type.String(), Type.Date()]),
  hasAttachments: Type.Boolean(),
  sizeBytes: Type.Number(),
  labels: Type.Optional(Type.Array(Type.String())),
  body: Type.Object({
    text: Type.String(),
    html: Type.String(),
    snippet: Type.String(),
  }),
  attachments: Type.Array(
    Type.Object({
      id: Type.String(),
      filename: Type.String(),
      contentType: Type.String(),
      sizeBytes: Type.Number(),
      downloadUrl: Type.String(),
    }),
  ),
});
