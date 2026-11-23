import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  enabled: Type.Boolean(),
  region: Type.Optional(Type.String({ default: "us-east-1" })),
  accessKeyId: Type.Optional(Type.String()),
  secretAccessKey: Type.Optional(Type.String()),
  fromEmail: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
