import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Complete organization and initial domain onboarding",
  deprecated: false,
  tags: ["auth", "organization"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  orgName: Type.String({ minLength: 2, description: "Organization display name" }),
  slug: Type.String({ minLength: 2, pattern: "^[a-z0-9-]+$", description: "Unique URL slug" }),
  domainName: Type.String({ minLength: 3, description: "Primary email domain" }),
  adminEmail: Type.String({ minLength: 3, description: "Administrator email address" }),
  adminPassword: Type.String({ minLength: 8, description: "Administrator account password" }),
  adminDisplayName: Type.Optional(Type.String()),
  storageConfig: Type.Optional(
    Type.Object({
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
    }),
  ),
});

export const outputSchema = Type.Object({
  userId: Type.String(),
  email: Type.String(),
  orgId: Type.String(),
  orgName: Type.String(),
  domainId: Type.String(),
  domainName: Type.String(),
  requiresOnboarding: Type.Boolean(),
  dnsRecords: Type.Array(
    Type.Object({
      type: Type.String(),
      name: Type.String(),
      value: Type.String(),
      priority: Type.Optional(Type.Number()),
      description: Type.String(),
    }),
  ),
});
