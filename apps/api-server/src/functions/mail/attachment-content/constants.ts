import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  messageId: Type.String(),
  attachmentId: Type.String(),
});

export const outputSchema = Type.Object({
  filename: Type.String(),
  contentType: Type.String(),
  data: Type.String(),
});
