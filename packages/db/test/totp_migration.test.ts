import test from "node:test";
import assert from "node:assert/strict";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  CredentialModel,
  UserModel,
  Types,
  detectDuplicateTotpCredentials,
  runTotpDeduplicationMigration,
  rollbackTotpDeduplicationMigration,
} from "../dist/index.js";

const TEST_DB_NAME = `cellsinbox_test_totp_mig_${Date.now()}`;

test("Safe TOTP Credential Deduplication Migration (Priority 3)", async (t) => {
  await connectToTestDatabase(TEST_DB_NAME);
  t.after(async () => {
    await cleanupTestDatabase();
  });

  const testUserId = new Types.ObjectId();

  await t.test("1. Setup duplicate fixture without throwing E11000", async () => {
    // Drop unique index if it already exists so we can seed duplicates
    try {
      await CredentialModel.collection.dropIndex("userId_1_type_1_totp_unique");
    } catch {
      // ignore if not present
    }

    // Insert 3 duplicate TOTP credentials simulating legacy duplicate defect
    const now = Date.now();
    await CredentialModel.collection.insertMany([
      {
        userId: testUserId,
        type: "TOTP",
        name: "Oldest App",
        secret: "SECRET_OLDEST_111",
        createdAt: new Date(now - 100000),
        lastUsedAt: new Date(now - 50000),
      },
      {
        userId: testUserId,
        type: "TOTP",
        name: "Active Recent App",
        secret: "SECRET_RECENT_222",
        createdAt: new Date(now - 30000),
        lastUsedAt: new Date(now - 1000), // Most recent use
      },
      {
        userId: testUserId,
        type: "TOTP",
        name: "Never Used App",
        secret: "SECRET_UNUSED_333",
        createdAt: new Date(now - 10000),
        // missing lastUsedAt and lastUsedTimeStep
      },
    ]);

    const count = await CredentialModel.countDocuments({ userId: testUserId, type: "TOTP" });
    assert.equal(count, 3, "Must have seeded 3 duplicate TOTP credentials");
  });

  await t.test("2. Detects duplicates accurately", async () => {
    const duplicates = await detectDuplicateTotpCredentials();
    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0].userId, testUserId.toString());
    assert.equal(duplicates[0].count, 3);
  });

  await t.test("3. Runs migration safely: preserves primary, archives duplicates, builds index", async () => {
    const result = await runTotpDeduplicationMigration();
    assert.equal(result.usersAffected, 1);
    assert.equal(result.credentialsArchived, 2);
    assert.equal(result.indexCreated, true);
    assert.equal(result.errors.length, 0);

    // Primary TOTP credential must be the most recently used one
    const activeTotp = await CredentialModel.findOne({ userId: testUserId, type: "TOTP" }).select("+secret");
    assert.ok(activeTotp);
    assert.equal(activeTotp.name, "Active Recent App");
    assert.equal(activeTotp.secret, "SECRET_RECENT_222");

    // Secondary credentials must be preserved under ARCHIVED_TOTP without data loss
    const archived = await CredentialModel.find({ userId: testUserId, type: "ARCHIVED_TOTP" }).select("+secret");
    assert.equal(archived.length, 2, "Zero credentials deleted; secondary records archived intact");

    // All records must have lastUsedTimeStep initialized
    const allCreds = await CredentialModel.find({ userId: testUserId });
    for (const c of allCreds) {
      assert.notEqual(c.lastUsedTimeStep, undefined);
    }
  });

  await t.test("4. Verifies unique index prevents new duplicate TOTP records", async () => {
    await assert.rejects(
      async () => {
        await CredentialModel.collection.insertOne({
          userId: testUserId,
          type: "TOTP",
          name: "Illegal Duplicate",
          secret: "SECRET_NEW_444",
          createdAt: new Date(),
        });
      },
      /E11000 duplicate key error/,
      "Index must reject duplicate TOTP for the same user",
    );
  });

  await t.test("5. Verifies safe rollback: drops index and restores archived credentials", async () => {
    const rollback = await rollbackTotpDeduplicationMigration();
    assert.equal(rollback.rolledBack, 2);
    assert.equal(rollback.indexDropped, true);

    const totpCount = await CredentialModel.countDocuments({ userId: testUserId, type: "TOTP" });
    assert.equal(totpCount, 3, "All 3 credentials restored to TOTP");
  });
});
