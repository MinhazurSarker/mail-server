import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  provider: Type.Union([
    Type.Literal("cloudflare_r2"),
    Type.Literal("aws_s3"),
    Type.Literal("minio"),
    Type.Literal("custom_s3"),
    Type.Literal("local_fallback"),
  ]),
  endpoint: Type.String(),
  bucket: Type.String(),
  region: Type.Optional(Type.String({ default: "auto" })),
  accessKeyId: Type.String(),
  secretAccessKey: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
