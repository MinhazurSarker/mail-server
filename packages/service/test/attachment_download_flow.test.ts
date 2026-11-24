import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  connectToTestDatabase,
  cleanupTestDatabase,
  disconnectDatabase,
  OrganizationModel,
  UserModel,
  MessageModel,
  MailboxStateModel,
  AttachmentModel,
} from "@cellsinbox/db";
import {
  MailService,
  StorageService,
  DomainService,
  migrateLegacyStorageBlobs,
} from "../src/index.js";

test("Hardened Attachment Storage, Tenant Isolation & Migration", async (t) => {
  let dbUri = "";
  let dbName = "";
  let tempStorageRoot = "";

  t.before(async () => {
    dbName = `cellsinbox_test_attachment_${Date.now()}`;
    await connectToTestDatabase(dbName);
    dbUri = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017";

    // Set isolated absolute storage root for the test suite
    tempStorageRoot = path.join(os.tmpdir(), `cellsinbox_test_blobs_${Date.now()}`);
    await fs.mkdir(tempStorageRoot, { recursive: true });
    process.env.STORAGE_LOCAL_DIR = tempStorageRoot;
  });

  t.after(async () => {
    delete process.env.STORAGE_LOCAL_DIR;
    delete process.env.LEGACY_STORAGE_DIR;
    try {
      await fs.rm(tempStorageRoot, { recursive: true, force: true });
    } catch {}

    if (dbUri && dbName) {
      await cleanupTestDatabase(dbUri, dbName);
    } else {
      await disconnectDatabase();
    }
  });

  await t.test("1. local_fallback returns empty downloadUrl to prevent browser sandbox blockage", async () => {
    const signedUrl = await StorageService.getAttachmentSignedUrl(
      { provider: "local_fallback", bucket: "", endpoint: tempStorageRoot, region: "auto", accessKeyId: "", secretAccessKey: "" },
      "attachments/org1/2026-11-24/test.png"
    );
    assert.strictEqual(signedUrl, "", "Must return empty string for local_fallback instead of file://");
  });

  await t.test("2. Strictly blocks path traversal attempts from escaping storage root", async () => {
    const config = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: tempStorageRoot,
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    };

    const maliciousKeys = [
      "../../etc/passwd",
      "../../../etc/shadow",
      "..\\..\\windows\\system32\\config",
      "/etc/hosts",
      "attachments/org1/../../../../etc/passwd",
    ];

    for (const badKey of maliciousKeys) {
      assert.throws(
        () => StorageService.resolveSecureLocalPath(config, badKey),
        /Security Violation: Storage path escape detected/,
        `Should reject traversal for key: ${badKey}`
      );
    }
  });

  await t.test("3. Stores and retrieves valid attachment inside absolute root", async () => {
    const org = await OrganizationModel.create({
      name: "Attachment Test Org",
      slug: `att-org-${Date.now()}`,
      status: "ACTIVE",
      tier: "PRO",
    });

    const domain = await DomainService.addDomain(
      org._id.toString(),
      `att-${Date.now()}.local`
    );

    const userA = await UserModel.create({
      organizationId: org._id,
      domainId: domain._id,
      email: `user-a-${Date.now()}@test.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
    });

    const message = await MessageModel.create({
      organizationId: org._id,
      messageId: `<test-${Date.now()}@test.local>`,
      from: { name: "Sender", address: "sender@example.com" },
      to: [{ address: userA.email }],
      subject: "Test Attachment Email",
      date: new Date(),
      s3RawKey: `raw/${org._id}/test.eml`,
      sizeBytes: 1024,
      hasAttachments: true,
    });

    await MailboxStateModel.create({
      userId: userA._id,
      messageId: message._id,
      folder: "INBOX",
      isRead: false,
      isStarred: false,
    });

    const sampleContent = Buffer.from("Hello World Absolute Root Attachment");
    const attKey = `attachments/${org._id}/2026-11-24/${crypto.randomUUID()}-sample.txt`;

    const storageConfig = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: tempStorageRoot,
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    };

    await StorageService.uploadAttachment(storageConfig, attKey, sampleContent, "text/plain");

    const attachment = await AttachmentModel.create({
      messageId: message._id,
      filename: "sample.txt",
      contentType: "text/plain",
      sizeBytes: sampleContent.length,
      s3ObjectKey: attKey,
    });

    // Verify file is saved strictly within tempStorageRoot
    const targetOnDisk = StorageService.resolveSecureLocalPath(storageConfig, attKey);
    assert.ok(targetOnDisk.startsWith(tempStorageRoot), "Target file must be inside tempStorageRoot");
    const stat = await fs.stat(targetOnDisk);
    assert.strictEqual(stat.size, sampleContent.length);

    // Retrieve via MailService
    const res = await MailService.getAttachmentContent({
      userId: userA._id.toString(),
      attachmentId: attachment._id.toString(),
    });

    assert.strictEqual(res.filename, "sample.txt");
    const decoded = Buffer.from(res.data, "base64").toString("utf-8");
    assert.strictEqual(decoded, "Hello World Absolute Root Attachment");
  });

  await t.test("4. Strictly enforces cross-tenant boundary and rejects unauthorized access", async () => {
    const org1 = await OrganizationModel.create({
      name: "Tenant 1",
      slug: `t1-${Date.now()}`,
      status: "ACTIVE",
      tier: "PRO",
    });
    const org2 = await OrganizationModel.create({
      name: "Tenant 2",
      slug: `t2-${Date.now()}`,
      status: "ACTIVE",
      tier: "PRO",
    });

    const domain1 = await DomainService.addDomain(org1._id.toString(), `t1-${Date.now()}.local`);
    const domain2 = await DomainService.addDomain(org2._id.toString(), `t2-${Date.now()}.local`);

    const user1 = await UserModel.create({
      organizationId: org1._id,
      domainId: domain1._id,
      email: `user1-${Date.now()}@t1.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
    });

    const user2 = await UserModel.create({
      organizationId: org2._id,
      domainId: domain2._id,
      email: `user2-${Date.now()}@t2.local`,
      passwordHash: "hash",
      role: "MAILBOX_USER",
      status: "ACTIVE",
    });

    const message = await MessageModel.create({
      organizationId: org1._id,
      messageId: `<tenant-${Date.now()}@t1.local>`,
      from: { name: "Sender", address: "sender@t1.local" },
      to: [{ address: user1.email }],
      subject: "Tenant 1 Confidential Attachment",
      date: new Date(),
      s3RawKey: `raw/${org1._id}/test.eml`,
      sizeBytes: 1024,
      hasAttachments: true,
    });

    await MailboxStateModel.create({
      userId: user1._id,
      messageId: message._id,
      folder: "INBOX",
      isRead: false,
      isStarred: false,
    });

    const attKey = `attachments/${org1._id}/2026-11-24/${crypto.randomUUID()}-confidential.pdf`;
    const storageConfig = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: tempStorageRoot,
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    };
    await StorageService.uploadAttachment(storageConfig, attKey, Buffer.from("CONFIDENTIAL"), "application/pdf");

    const attachment = await AttachmentModel.create({
      messageId: message._id,
      filename: "confidential.pdf",
      contentType: "application/pdf",
      sizeBytes: 12,
      s3ObjectKey: attKey,
    });

    // User 2 from Tenant 2 attempting to access Tenant 1's attachment MUST BE REJECTED
    await assert.rejects(
      async () => {
        await MailService.getAttachmentContent({
          userId: user2._id.toString(),
          attachmentId: attachment._id.toString(),
        });
      },
      /Unauthorized: Message not in user mailbox/
    );

    // If an attacker tampers mailbox state to reference a message from another tenant:
    await MailboxStateModel.create({
      userId: user2._id,
      messageId: message._id,
      folder: "INBOX",
    });

    await assert.rejects(
      async () => {
        await MailService.getAttachmentContent({
          userId: user2._id.toString(),
          attachmentId: attachment._id.toString(),
        });
      },
      /Unauthorized: Cross-tenant attachment access denied/
    );
  });

  await t.test("5. Rejects missing files cleanly with documented error", async () => {
    const config = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: tempStorageRoot,
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    };

    await assert.rejects(
      async () => {
        await StorageService.getRawFile(config, "attachments/org1/2026-11-24/nonexistent-uuid-file.bin");
      },
      /Attachment file not found at storage location/
    );
  });

  await t.test("6. Explicit legacy storage migration transfers files accurately", async () => {
    const legacyDir = path.join(os.tmpdir(), `cellsinbox_legacy_${Date.now()}`);
    const legacyKey = "attachments/legacy-org/2026-11-20/old-doc.pdf";
    const legacyFullPath = path.join(legacyDir, legacyKey);
    await fs.mkdir(path.dirname(legacyFullPath), { recursive: true });
    await fs.writeFile(legacyFullPath, "Legacy PDF Content");

    const migrationResult = await migrateLegacyStorageBlobs(legacyDir, tempStorageRoot);
    assert.strictEqual(migrationResult.migratedCount, 1);
    assert.strictEqual(migrationResult.errors.length, 0);

    // Verify it is now directly readable in targetStorageRoot
    const targetConfig = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: tempStorageRoot,
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    };

    const migratedBuf = await StorageService.getRawFile(targetConfig, legacyKey);
    assert.strictEqual(migratedBuf.toString("utf-8"), "Legacy PDF Content");

    // Clean up temporary legacy directory
    await fs.rm(legacyDir, { recursive: true, force: true });
  });
});
