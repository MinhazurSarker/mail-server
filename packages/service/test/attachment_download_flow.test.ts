import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
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
import { MailService, StorageService, DomainService } from "../src/index.js";

test("Attachment Download & Storage Fallback Flow", async (t) => {
  let dbUri = "";
  let dbName = "";

  t.before(async () => {
    dbName = `cellsinbox_test_attachment_${Date.now()}`;
    await connectToTestDatabase(dbName);
    dbUri = process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017";
  });

  t.after(async () => {
    if (dbUri && dbName) {
      await cleanupTestDatabase(dbUri, dbName);
    } else {
      await disconnectDatabase();
    }
  });

  await t.test("local_fallback returns empty downloadUrl to prevent browser sandbox blockage", async () => {
    const signedUrl = await StorageService.getAttachmentSignedUrl(
      { provider: "local_fallback" as any, bucket: "", endpoint: "./storage/blobs", region: "auto", accessKeyId: "", secretAccessKey: "" },
      "attachments/org1/2026-11-24/test.png"
    );
    assert.strictEqual(signedUrl, "", "Must return empty string for local_fallback instead of file://");
  });

  await t.test("stores, retrieves, and authorizes attachment content securely", async () => {
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

    const userB = await UserModel.create({
      organizationId: org._id,
      domainId: domain._id,
      email: `user-b-${Date.now()}@test.local`,
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

    // In user A's mailbox
    await MailboxStateModel.create({
      userId: userA._id,
      messageId: message._id,
      folder: "INBOX",
      isRead: false,
      isStarred: false,
    });

    const sampleContent = Buffer.from("Hello World Attachment Content 12345");
    const attKey = `attachments/${org._id}/2026-11-24/${crypto.randomUUID()}-sample.txt`;

    const storageConfig = {
      provider: "local_fallback" as const,
      bucket: "default",
      endpoint: "./storage/blobs",
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

    // 1. User A can retrieve attachment content
    const res = await MailService.getAttachmentContent({
      userId: userA._id.toString(),
      attachmentId: attachment._id.toString(),
    });

    assert.strictEqual(res.filename, "sample.txt");
    assert.strictEqual(res.contentType, "text/plain");
    const decoded = Buffer.from(res.data, "base64").toString("utf-8");
    assert.strictEqual(decoded, "Hello World Attachment Content 12345");

    // 2. User B (not having this message in mailbox) is rejected with Unauthorized
    await assert.rejects(
      async () => {
        await MailService.getAttachmentContent({
          userId: userB._id.toString(),
          attachmentId: attachment._id.toString(),
        });
      },
      /Unauthorized: Message not in user mailbox/
    );

    // 3. Non-existent attachment rejected
    await assert.rejects(
      async () => {
        await MailService.getAttachmentContent({
          userId: userA._id.toString(),
          attachmentId: "507f1f77bcf86cd799439011",
        });
      },
      /Attachment not found/
    );
  });
});
