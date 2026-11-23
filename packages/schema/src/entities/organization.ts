import { Type, type Static } from "@sinclair/typebox";

export const StorageConfigSchema = Type.Object({
  provider: Type.Union([
    Type.Literal("cloudflare_r2"),
    Type.Literal("aws_s3"),
    Type.Literal("minio"),
    Type.Literal("custom_s3"),
    Type.Literal("local_fallback"),
  ]),
  endpoint: Type.String({ description: "S3 compatible endpoint URL" }),
  bucket: Type.String({ minLength: 1, description: "S3 bucket name" }),
  region: Type.String({ default: "auto", description: "AWS/R2 region" }),
  accessKeyId: Type.String({ minLength: 1, description: "S3 access key ID" }),
  secretAccessKey: Type.String({ minLength: 1, description: "S3 secret access key" }),
  publicUrlPrefix: Type.Optional(Type.String({ description: "Optional public CDN prefix URL" })),
});
export type StorageConfig = Static<typeof StorageConfigSchema>;

export const OrganizationStatusSchema = Type.Union([
  Type.Literal("PENDING_APPROVAL"),
  Type.Literal("ACTIVE"),
  Type.Literal("SUSPENDED"),
]);
export type OrganizationStatus = Static<typeof OrganizationStatusSchema>;

export const SesBackupConfigSchema = Type.Object({
  enabled: Type.Boolean({ default: false }),
  region: Type.String({ default: "us-east-1" }),
  accessKeyId: Type.Optional(Type.String()),
  secretAccessKey: Type.Optional(Type.String()),
  fromEmail: Type.Optional(Type.String()),
});
export type SesBackupConfig = Static<typeof SesBackupConfigSchema>;

export const OrganizationBrandingSchema = Type.Object({
  logoUrl: Type.Optional(Type.String()),
  faviconUrl: Type.Optional(Type.String()),
  companyName: Type.Optional(Type.String()),
  primaryColor: Type.Optional(Type.String()),
});
export type OrganizationBranding = Static<typeof OrganizationBrandingSchema>;

export const OrganizationSchema = Type.Object({
  id: Type.String(),
  name: Type.String({ minLength: 2 }),
  slug: Type.String({ minLength: 2 }),
  status: OrganizationStatusSchema,
  branding: Type.Optional(OrganizationBrandingSchema),
  customWebmailDomains: Type.Optional(Type.Array(Type.String())),
  storageConfig: Type.Optional(StorageConfigSchema),
  sesBackupConfig: Type.Optional(SesBackupConfigSchema),
  maxDomains: Type.Number({ default: 5 }),
  maxUsers: Type.Number({ default: 50 }),
  maxStorageBytes: Type.Number({ default: 107374182400 }), // 100GB default quota
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type Organization = Static<typeof OrganizationSchema>;
