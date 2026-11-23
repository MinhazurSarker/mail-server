import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Test connection to S3 / Cloudflare R2 bucket",
  deprecated: false,
  tags: ["admin", "storage"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  provider: Type.Union([
    Type.Literal("cloudflare_r2"),
    Type.Literal("aws_s3"),
    Type.Literal("minio"),
    Type.Literal("local_fallback"),
  ]),
  endpoint: Type.Optional(Type.String()),
  bucket: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  accessKeyId: Type.Optional(Type.String()),
  secretAccessKey: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  latencyMs: Type.Optional(Type.Number()),
});
