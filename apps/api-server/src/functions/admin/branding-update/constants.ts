import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Update organization white-label branding and custom webmail domains",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  logoUrl: Type.Optional(Type.String({ description: "Public URL of organization logo" })),
  faviconUrl: Type.Optional(Type.String({ description: "Public URL of organization favicon" })),
  companyName: Type.Optional(Type.String({ description: "Custom display company name" })),
  primaryColor: Type.Optional(Type.String({ description: "Hex brand accent color (e.g. #0284c7)" })),
  customWebmailDomains: Type.Optional(Type.Array(Type.String({ description: "CNAME domains pointing to webmail" }))),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
