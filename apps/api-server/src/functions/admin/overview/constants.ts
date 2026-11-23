import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  slug: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  organizationName: Type.String(),
  slug: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  domainsCount: Type.Number(),
  usersCount: Type.Number(),
  apiKeysCount: Type.Number(),
  storageProvider: Type.String(),
  sesBackupEnabled: Type.Boolean(),
  isPrimaryPort25Active: Type.Boolean(),
});
