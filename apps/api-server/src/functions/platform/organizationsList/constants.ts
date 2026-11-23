import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "List all onboarded tenant organizations",
  deprecated: false,
  tags: ["platform"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  status: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
      slug: Type.String(),
      status: Type.String(),
      primaryDomain: Type.String(),
      usersCount: Type.Number(),
      domainsCount: Type.Number(),
      maxStorageBytes: Type.Number(),
      createdAt: Type.String(),
    }),
  ),
  total: Type.Number(),
});
