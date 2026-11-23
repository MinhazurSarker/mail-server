import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  organizationName: Type.String(),
  domainsCount: Type.Number(),
  usersCount: Type.Number(),
  apiKeysCount: Type.Number(),
  storageProvider: Type.String(),
  sesBackupEnabled: Type.Boolean(),
  isPrimaryPort25Active: Type.Boolean(),
});
