import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get organization white-label branding and custom webmail domains",
  deprecated: false,
  tags: ["admin"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  logoUrl: Type.Optional(Type.String()),
  faviconUrl: Type.Optional(Type.String()),
  companyName: Type.Optional(Type.String()),
  primaryColor: Type.Optional(Type.String()),
  customWebmailDomains: Type.Array(Type.String()),
});
