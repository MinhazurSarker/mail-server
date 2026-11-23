import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  provider: Type.String(),
  endpoint: Type.Optional(Type.String()),
  bucket: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  accessKeyId: Type.Optional(Type.String()),
});
