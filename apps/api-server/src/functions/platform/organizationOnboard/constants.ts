import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Onboard new tenant organization onto CellsInbox platform",
  deprecated: false,
  tags: ["platform"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  slug: Type.String({ minLength: 2 }),
  domainName: Type.String({ minLength: 3 }),
  adminEmail: Type.String({ minLength: 3 }),
  adminPassword: Type.String({ minLength: 8 }),
  adminDisplayName: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  organizationId: Type.String(),
  slug: Type.String(),
  adminEmail: Type.String(),
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
