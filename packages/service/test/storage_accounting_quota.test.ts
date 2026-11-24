import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
  MessageModel,
  MailboxStorageLedgerModel,
  StoragePurgeQueueModel,
  Types,
} from "@cellsinbox/db";
import {
  StorageAccountingService,
  MailboxOverQuotaError,
} from "../src/index.js";

test("Batch A: Storage Accounting Ledger, Quota Enforcement & Idempotency", async (t) => {
  let dbName = "";
  let orgId: Types.ObjectId;
  let domainId: Types.ObjectId;

  t.before(async () => {
    dbName = `cellsinbox_test_storage_accounting_${Date.now()}`;
    await connectToTestDatabase(dbName);

    const org = await OrganizationModel.create({
      name: "Accounting Test Org",
      slug: `accounting-test-${Date.now()}`,
    });
    orgId = org._id;

    const domain = await DomainModel.create({
      organizationId: orgId,
      name: `acct-${Date.now()}.local`,
      isVerified: true,
      verificationToken: "token-test",
      dkimPublicKey: "dkim-test-public-key",
      dkimPrivateKeyEncrypted: "dkim-test-private-key",
    });
    domainId = domain._id;
  });

  t.after(async () => {
    await cleanupTestDatabase(dbName);
    await disconnectDatabase();
  });

  await t.test("1. Preliminary quota eligibility check correctly reports capacity", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `eligibility-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 10000,
      storageUsedBytes: 7000,
    });

    const canFit2k = await StorageAccountingService.checkQuotaEligibility(user._id, 2000);
    assert.strictEqual(canFit2k.eligible, true);
    assert.strictEqual(canFit2k.remaining, 3000);
    assert.strictEqual(canFit2k.currentUsage, 7000);

    const cannotFit4k = await StorageAccountingService.checkQuotaEligibility(user._id, 4000);
    assert.strictEqual(cannotFit4k.eligible, false);
    assert.strictEqual(cannotFit4k.remaining, 3000);
  });

  await t.test("2. Atomic condition-bounded quota reservation enforces hard limits", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `quota-enforce-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 10000,
      storageUsedBytes: 0,
    });

    const msg1Id = new Types.ObjectId();
    const op1 = `inbound-${crypto.randomUUID()}`;

    // Allocate 6000 bytes -> Should succeed
    const res1 = await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: msg1Id,
      operationId: op1,
      sizeBytes: 6000,
      operation: "INBOUND",
    });

    assert.strictEqual(res1.charged, true);
    assert.strictEqual(res1.currentUsage, 6000);

    const check1 = await UserModel.findById(user._id);
    assert.strictEqual(check1?.storageUsedBytes, 6000);
    assert.strictEqual(check1?.storageAccountingVersion, 1);

    // Attempt to allocate 5000 bytes (6000 + 5000 = 11000 > 10000) -> Must throw MailboxOverQuotaError
    const msg2Id = new Types.ObjectId();
    const op2 = `inbound-${crypto.randomUUID()}`;

    await assert.rejects(
      async () => {
        await StorageAccountingService.reserveAndChargeMailbox({
          userId: user._id,
          organizationId: orgId,
          messageId: msg2Id,
          operationId: op2,
          sizeBytes: 5000,
          operation: "INBOUND",
        });
      },
      (err: any) => {
        assert(err instanceof MailboxOverQuotaError);
        assert.strictEqual(err.smtpCode, 452);
        assert.strictEqual(err.enhancedCode, "4.2.2");
        return true;
      }
    );

    // Verify counter was NOT incremented on failed reservation
    const check2 = await UserModel.findById(user._id);
    assert.strictEqual(check2?.storageUsedBytes, 6000);
    assert.strictEqual(check2?.storageAccountingVersion, 1);
  });

  await t.test("3. Idempotent operation retry prevents duplicate charges", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `idempotent-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 20000,
      storageUsedBytes: 0,
    });

    const msgId = new Types.ObjectId();
    const opId = `op-retry-${crypto.randomUUID()}`;

    // First call
    const res1 = await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: msgId,
      operationId: opId,
      sizeBytes: 4000,
      operation: "OUTBOUND",
    });
    assert.strictEqual(res1.charged, true);
    assert.strictEqual(res1.currentUsage, 4000);

    // Immediate retry with same operationId
    const res2 = await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: msgId,
      operationId: opId,
      sizeBytes: 4000,
      operation: "OUTBOUND",
    });
    assert.strictEqual(res2.charged, false);
    assert.strictEqual(res2.currentUsage, 4000);

    // Verify only ONE ledger record exists
    const ledgerCount = await MailboxStorageLedgerModel.countDocuments({
      userId: user._id,
      messageId: msgId,
    });
    assert.strictEqual(ledgerCount, 1);

    const userCheck = await UserModel.findById(user._id);
    assert.strictEqual(userCheck?.storageUsedBytes, 4000);
  });

  await t.test("4. Self-send deduplication prevents double-charging mailbox", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `selfsend-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 20000,
      storageUsedBytes: 0,
    });

    const canonicalMsgId = new Types.ObjectId();

    // 1. Charge for SENT state
    const sentCharge = await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: canonicalMsgId,
      operationId: `sent-action-${crypto.randomUUID()}`,
      sizeBytes: 3500,
      operation: "OUTBOUND",
    });
    assert.strictEqual(sentCharge.charged, true);
    assert.strictEqual(sentCharge.currentUsage, 3500);

    // 2. Local delivery creates INBOX state for the same self-sent message
    const inboxDelivery = await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: canonicalMsgId,
      operationId: `inbox-delivery-${crypto.randomUUID()}`,
      sizeBytes: 3500,
      operation: "INBOUND",
    });

    assert.strictEqual(inboxDelivery.charged, false);
    assert.strictEqual(inboxDelivery.reason, "ALREADY_CHARGED");
    assert.strictEqual(inboxDelivery.currentUsage, 3500);

    // Total usage must remain exactly 3500, NOT 7000
    const userCheck = await UserModel.findById(user._id);
    assert.strictEqual(userCheck?.storageUsedBytes, 3500);

    const ledgers = await MailboxStorageLedgerModel.find({
      userId: user._id,
      messageId: canonicalMsgId,
    });
    assert.strictEqual(ledgers.length, 1);
  });

  await t.test("5. Permanent purge releases quota accurately and is idempotent", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `purge-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 20000,
      storageUsedBytes: 0,
    });

    const msgId = new Types.ObjectId();
    await StorageAccountingService.reserveAndChargeMailbox({
      userId: user._id,
      organizationId: orgId,
      messageId: msgId,
      operationId: `msg-${crypto.randomUUID()}`,
      sizeBytes: 5000,
      operation: "INBOUND",
    });

    const userBefore = await UserModel.findById(user._id);
    assert.strictEqual(userBefore?.storageUsedBytes, 5000);

    // Permanent purge
    const releaseResult = await StorageAccountingService.releaseMailboxCharge({
      userId: user._id,
      messageId: msgId,
    });
    assert.strictEqual(releaseResult.released, true);
    assert.strictEqual(releaseResult.releasedBytes, 5000);

    const userAfter = await UserModel.findById(user._id);
    assert.strictEqual(userAfter?.storageUsedBytes, 0);

    // Second purge attempt for already purged message is safe no-op
    const releaseAgain = await StorageAccountingService.releaseMailboxCharge({
      userId: user._id,
      messageId: msgId,
    });
    assert.strictEqual(releaseAgain.released, false);
    assert.strictEqual(releaseAgain.releasedBytes, 0);

    const userFinal = await UserModel.findById(user._id);
    assert.strictEqual(userFinal?.storageUsedBytes, 0);
  });

  await t.test("6. Multi-recipient delivery maintains independent mailbox accounting", async () => {
    const userA = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `recip-a-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 10000,
      storageUsedBytes: 0,
    });

    const userB = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `recip-b-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 10000,
      storageUsedBytes: 0,
    });

    const sharedMsgId = new Types.ObjectId();
    const size = 4500;

    // Both recipients receive the shared message
    const resA = await StorageAccountingService.reserveAndChargeMailbox({
      userId: userA._id,
      organizationId: orgId,
      messageId: sharedMsgId,
      operationId: `del-a-${crypto.randomUUID()}`,
      sizeBytes: size,
      operation: "INBOUND",
    });
    const resB = await StorageAccountingService.reserveAndChargeMailbox({
      userId: userB._id,
      organizationId: orgId,
      messageId: sharedMsgId,
      operationId: `del-b-${crypto.randomUUID()}`,
      sizeBytes: size,
      operation: "INBOUND",
    });

    assert.strictEqual(resA.charged, true);
    assert.strictEqual(resB.charged, true);

    const checkA = await UserModel.findById(userA._id);
    const checkB = await UserModel.findById(userB._id);
    assert.strictEqual(checkA?.storageUsedBytes, 4500);
    assert.strictEqual(checkB?.storageUsedBytes, 4500);

    // User A purges -> User A quota released; User B quota intact
    await StorageAccountingService.releaseMailboxCharge({
      userId: userA._id,
      messageId: sharedMsgId,
    });

    const checkA2 = await UserModel.findById(userA._id);
    const checkB2 = await UserModel.findById(userB._id);
    assert.strictEqual(checkA2?.storageUsedBytes, 0);
    assert.strictEqual(checkB2?.storageUsedBytes, 4500);

    const remainingLedgers = await MailboxStorageLedgerModel.find({ messageId: sharedMsgId });
    assert.strictEqual(remainingLedgers.length, 1);
    assert.strictEqual(remainingLedgers[0].userId.toString(), userB._id.toString());
  });

  await t.test("7. Concurrent reservation race against remaining quota allows exactly one winner", async () => {
    const user = await UserModel.create({
      organizationId: orgId,
      domainId,
      email: `concurrency-${Date.now()}@acct.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
      storageQuotaBytes: 5000,
      storageUsedBytes: 1000, // 4000 remaining
    });

    // Launch 5 parallel requests each requesting 3000 bytes
    // Exactly 1 must win (1000 + 3000 = 4000 <= 5000), 4 must be rejected
    const promises = Array.from({ length: 5 }).map(async (_, idx) => {
      try {
        const res = await StorageAccountingService.reserveAndChargeMailbox({
          userId: user._id,
          organizationId: orgId,
          messageId: new Types.ObjectId(),
          operationId: `concurrent-${idx}-${crypto.randomUUID()}`,
          sizeBytes: 3000,
          operation: "INBOUND",
        });
        return { success: true, res };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    });

    const results = await Promise.all(promises);
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    assert.strictEqual(successes.length, 1, "Exactly one concurrent reservation should succeed");
    assert.strictEqual(failures.length, 4, "Four concurrent reservations should be rejected");

    const finalUser = await UserModel.findById(user._id);
    assert.strictEqual(finalUser?.storageUsedBytes, 4000);
  });

  await t.test("8. Durable purge queue enqueues immutable storage locations", async () => {
    const locations = [
      {
        provider: "local_fallback" as const,
        bucket: "default",
        key: `messages/${orgId}/2026-11-25/sample.eml`,
      },
      {
        provider: "local_fallback" as const,
        bucket: "default",
        key: `attachments/${orgId}/2026-11-25/sample.pdf`,
      },
    ];

    await StorageAccountingService.enqueueStoragePurge({
      organizationId: orgId,
      locations,
    });

    const purgeItem = await StoragePurgeQueueModel.findOne({ organizationId: orgId });
    assert(purgeItem);
    assert.strictEqual(purgeItem.status, "PENDING");
    assert.strictEqual(purgeItem.attempts, 0);
    assert.strictEqual(purgeItem.locations.length, 2);
    assert.strictEqual(purgeItem.locations[0].key, locations[0].key);
  });
});
