import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Platform Admin global system overview",
  deprecated: false,
  tags: ["platform"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  totalOrganizations: Type.Number(),
  activeOrganizations: Type.Number(),
  suspendedOrganizations: Type.Number(),
  totalDomains: Type.Number(),
  totalUsers: Type.Number(),
  isPort25Active: Type.Boolean(),
});
