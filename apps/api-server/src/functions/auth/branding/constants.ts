import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Resolve white-label branding and organization identity by hostname or CNAME",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  host: Type.Optional(Type.String({ description: "Client hostname (e.g. webmail.tenantcorp.com)" })),
});

export const outputSchema = Type.Object({
  isCustom: Type.Boolean(),
  name: Type.String(),
  logoUrl: Type.Optional(Type.String()),
  faviconUrl: Type.Optional(Type.String()),
  primaryColor: Type.Optional(Type.String()),
  webmailHost: Type.String(),
});
