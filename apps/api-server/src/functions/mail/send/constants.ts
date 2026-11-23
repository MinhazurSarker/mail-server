import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  to: Type.Array(Type.String()),
  cc: Type.Optional(Type.Array(Type.String())),
  bcc: Type.Optional(Type.Array(Type.String())),
  subject: Type.String(),
  text: Type.Optional(Type.String()),
  html: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  messageId: Type.String(),
  deliveredInternally: Type.Number(),
  queuedOutbound: Type.Number(),
});
