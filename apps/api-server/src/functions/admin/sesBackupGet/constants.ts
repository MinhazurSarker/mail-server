import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  enabled: Type.Boolean(),
  region: Type.String(),
  accessKeyId: Type.Optional(Type.String()),
  fromEmail: Type.Optional(Type.String()),
});
