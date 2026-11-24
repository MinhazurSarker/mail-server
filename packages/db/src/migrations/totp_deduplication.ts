import { CredentialModel, type ICredential } from "../models/Credential.js";

export interface DuplicateTotpGroup {
  userId: string;
  count: number;
  records: Array<{
    id: string;
    name?: string;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export interface MigrationResult {
  duplicatesFound: number;
  usersAffected: number;
  credentialsArchived: number;
  indexCreated: boolean;
  errors: string[];
}

/**
 * Detects existing duplicate TOTP credential records across all users.
 */
export async function detectDuplicateTotpCredentials(): Promise<DuplicateTotpGroup[]> {
  const duplicates = await CredentialModel.aggregate([
    { $match: { type: "TOTP" } },
    {
      $group: {
        _id: "$userId",
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  const results: DuplicateTotpGroup[] = [];

  for (const group of duplicates) {
    const creds = await CredentialModel.find({ _id: { $in: group.ids } })
      .select("+secret")
      .sort({ lastUsedAt: -1, updatedAt: -1, createdAt: -1 });

    results.push({
      userId: group._id.toString(),
      count: group.count,
      records: creds.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        lastUsedAt: c.lastUsedAt,
        createdAt: c.createdAt,
        updatedAt: (c as any).updatedAt || c.createdAt,
      })),
    });
  }

  return results;
}

/**
 * Safe Migration:
 * 1. Preserves the primary/active TOTP factor (most recently used or updated).
 * 2. Archives (re-types to ARCHIVED_TOTP) secondary duplicates WITHOUT deleting any credentials.
 * 3. Backfills missing lastUsedTimeStep to 0 for legacy records.
 * 4. Verifies and installs the unique partial index { userId: 1, type: 1 } for type: "TOTP".
 */
export async function runTotpDeduplicationMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    duplicatesFound: 0,
    usersAffected: 0,
    credentialsArchived: 0,
    indexCreated: false,
    errors: [],
  };

  try {
    const duplicateGroups = await detectDuplicateTotpCredentials();
    result.duplicatesFound = duplicateGroups.reduce((acc, g) => acc + g.count, 0);
    result.usersAffected = duplicateGroups.length;

    for (const group of duplicateGroups) {
      // Fetch in order of precedence: lastUsedAt DESC, updatedAt DESC
      const creds = await CredentialModel.find({ userId: group.userId, type: "TOTP" })
        .sort({ lastUsedAt: -1, updatedAt: -1, createdAt: -1 });

      if (creds.length <= 1) continue;

      // Keep index 0 as primary; archive subsequent credentials
      for (let i = 1; i < creds.length; i++) {
        const secondary = creds[i];
        await CredentialModel.updateOne(
          { _id: secondary._id },
          {
            $set: {
              type: "ARCHIVED_TOTP",
              archivedReason: `Duplicate TOTP resolved by migration on ${new Date().toISOString()}. Primary preserved: ${creds[0]._id}`,
              archivedAt: new Date(),
            },
          },
        );
        result.credentialsArchived++;
      }
    }

    // Backfill any legacy records missing lastUsedTimeStep
    await CredentialModel.updateMany(
      { type: "TOTP", lastUsedTimeStep: { $exists: false } },
      { $set: { lastUsedTimeStep: 0 } },
    );

    // Install and verify unique index
    await CredentialModel.collection.createIndex(
      { userId: 1, type: 1 },
      {
        unique: true,
        partialFilterExpression: { type: "TOTP" },
        name: "userId_1_type_1_totp_unique",
      },
    );

    const indexes = await CredentialModel.collection.indexes();
    result.indexCreated = indexes.some((idx) => idx.name === "userId_1_type_1_totp_unique");
  } catch (err: any) {
    result.errors.push(err.message || String(err));
  }

  return result;
}

/**
 * Rollback Migration:
 * Drops the unique index and restores ARCHIVED_TOTP credentials to TOTP.
 */
export async function rollbackTotpDeduplicationMigration(): Promise<{ rolledBack: number; indexDropped: boolean }> {
  let indexDropped = false;
  try {
    await CredentialModel.collection.dropIndex("userId_1_type_1_totp_unique");
    indexDropped = true;
  } catch {
    // Index may not exist
  }

  const res = await CredentialModel.updateMany(
    { type: "ARCHIVED_TOTP", archivedReason: /Duplicate TOTP resolved by migration/ },
    {
      $set: { type: "TOTP" },
      $unset: { archivedReason: 1, archivedAt: 1 },
    },
  );

  return { rolledBack: res.modifiedCount, indexDropped };
}
