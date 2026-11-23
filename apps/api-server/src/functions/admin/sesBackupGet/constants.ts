import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  enabled: Type.Boolean(),
  region: Type.String(),
  accessKeyId: Type.Optional(Type.String()),
  fromEmail: Type.Optional(Type.String()),
});
