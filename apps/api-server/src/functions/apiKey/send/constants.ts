import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  from: Type.String(),
  fromName: Type.Optional(Type.String()),
  to: Type.Array(Type.String({ minLength: 3 })),
  subject: Type.String(),
  text: Type.Optional(Type.String()),
  html: Type.Optional(Type.String()),
  attachments: Type.Optional(
    Type.Array(
      Type.Object({
        filename: Type.String(),
        content: Type.String(),
        contentType: Type.String(),
      }),
    ),
  ),
});

export const outputSchema = Type.Object({
  messageId: Type.String(),
  status: Type.String(),
  to: Type.Array(Type.String()),
  deliveredInternally: Type.Number(),
  queuedOutbound: Type.Number(),
});
