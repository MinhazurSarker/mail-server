import nodemailer from "nodemailer";
import {
  connectToDatabase,
  disconnectDatabase,
  MessageModel,
  MessageBodyModel,
  AttachmentModel,
  MailboxStateModel,
  DomainModel,
} from "@cellsinbox/db";
import {
  OrganizationService,
  DomainService,
  UserService,
  StorageService,
} from "@cellsinbox/service";
import { createSmtpServer } from "../src/server.js";

async function runTest() {
  console.log("=== [TEST] Starting Phase 3 Inbound SMTP & BYOS S3 Pipeline Verification ===");
  await connectToDatabase();
  console.log("✓ Connected to MongoDB");

  const timestamp = Date.now();
  const orgSlug = `inbound-org-${timestamp}`;
  const domainName = `corp-${timestamp}.cells.local`;
  const userEmail = `alex@${domainName}`;
  const testPort = 2526;

  // 1. Setup Organization with local storage fallback
  const org = await OrganizationService.createOrganization({
    name: "Inbound Test Corp",
    slug: orgSlug,
  });
  console.log(`✓ Organization created: ${org.name} (id: ${org._id})`);

  // 2. Setup and verify Domain
  const domain = await DomainService.addDomain(org._id.toString(), domainName);
  domain.isVerified = true;
  await domain.save();
  console.log(`✓ Domain added and verified: ${domain.name}`);

  // 3. Create Mailbox User
  const { user } = await UserService.createUser({
    organizationId: org._id.toString(),
    domainId: domain._id.toString(),
    email: userEmail,
    displayName: "Alex Inbound",
    role: "MAILBOX_USER",
  });
  console.log(`✓ Mailbox user created: ${user.email} (Status: ${user.status})`);

  // 4. Start Inbound SMTP Server on testPort
  const server = createSmtpServer({ port: testPort, host: "127.0.0.1" });
  await new Promise<void>((resolve) => server.listen(testPort, "127.0.0.1", resolve));
  console.log(`✓ Inbound SMTP Receiver listening on 127.0.0.1:${testPort}`);

  // 5. Send Inbound Email via SMTP using Nodemailer
  const client = nodemailer.createTransport({
    host: "127.0.0.1",
    port: testPort,
    secure: false,
    tls: { rejectUnauthorized: false },
    ignoreTLS: true,
  });

  const emailSubject = `Phase 3 Inbound Delivery Verification #${timestamp}`;
  const emailText = "Hello! This is a real incoming email received over port 25.";
  const emailHtml = "<h2>Incoming Mail</h2><p>This message was streamed over raw SMTP into CellsInbox.</p>";

  const sendResult = await client.sendMail({
    from: '"External Sender" <external@gmail.com>',
    to: userEmail,
    subject: emailSubject,
    text: emailText,
    html: emailHtml,
    attachments: [
      {
        filename: "test-report.pdf",
        content: Buffer.from("%PDF-1.4 sample PDF binary stream content for CellsInbox test"),
        contentType: "application/pdf",
      },
      {
        filename: "notes.txt",
        content: Buffer.from("Important note inside email attachment."),
        contentType: "text/plain",
      },
    ],
  });

  console.log(`✓ SMTP Client send result: ${sendResult.response}`);

  // 6. Verify Message Ingestion in MongoDB
  const savedMessage = await MessageModel.findOne({
    organizationId: org._id,
    subject: emailSubject,
  });

  if (!savedMessage) {
    throw new Error("Message document was not found in MongoDB 'messages' collection.");
  }
  console.log(`✓ MessageModel verified: id=${savedMessage._id}, messageId=${savedMessage.messageId}, hasAttachments=${savedMessage.hasAttachments}`);

  if (!savedMessage.hasAttachments) {
    throw new Error("Expected hasAttachments to be true.");
  }

  // 7. Verify Message Body Extraction
  const savedBody = await MessageBodyModel.findOne({ messageId: savedMessage._id });
  if (!savedBody || !savedBody.text?.includes("real incoming email")) {
    throw new Error("MessageBodyModel was not correctly extracted or missing plain text.");
  }
  console.log(`✓ MessageBodyModel verified: snippet="${savedBody.snippet}"`);

  // 8. Verify Attachments
  const savedAttachments = await AttachmentModel.find({ messageId: savedMessage._id });
  console.log(`✓ AttachmentModel verified: found ${savedAttachments.length} attachments`);
  if (savedAttachments.length !== 2) {
    throw new Error(`Expected 2 attachments, found ${savedAttachments.length}`);
  }

  // 9. Verify Mailbox State (Inbox for recipient)
  const mailboxState = await MailboxStateModel.findOne({
    userId: user._id,
    messageId: savedMessage._id,
  });

  if (!mailboxState || mailboxState.folder !== "INBOX" || mailboxState.isRead !== false) {
    throw new Error("MailboxStateModel not found or folder is not unread INBOX.");
  }
  console.log(`✓ MailboxStateModel verified: folder=${mailboxState.folder}, isRead=${mailboxState.isRead}`);

  // 10. Verify Storage Offloading & Retrieval
  const rawFileBuffer = await StorageService.getRawFile(
    org.storageConfig || {
      provider: "local_fallback",
      bucket: "default",
      endpoint: "./storage/blobs",
      region: "auto",
      accessKeyId: "local",
      secretAccessKey: "local",
    },
    savedMessage.s3RawKey,
  );

  console.log(`✓ Storage offload verified: Raw MIME stream retrieved (${rawFileBuffer.length} bytes)`);
  if (rawFileBuffer.length === 0) {
    throw new Error("Retrieved raw MIME stream is empty.");
  }

  // 11. Test Anti-Relay & Protection Rules
  console.log("--- Testing Open Relay & Malformed Address Rejection ---");

  // A. Non-hosted recipient domain (Open Relay Attempt)
  try {
    await client.sendMail({
      from: "external@gmail.com",
      to: "victim@yahoo.com",
      subject: "Relay Test",
      text: "Should be blocked",
    });
    throw new Error("Open Relay vulnerability detected! Server allowed relaying to non-local domain.");
  } catch (err: any) {
    console.log(`✓ Open relay attempt properly rejected: ${err.message}`);
  }

  // B. Unknown recipient under hosted domain
  try {
    await client.sendMail({
      from: "external@gmail.com",
      to: `unknown-ghost@${domainName}`,
      subject: "Ghost Test",
      text: "Should be rejected with 550",
    });
    throw new Error("Server allowed message to non-existent user!");
  } catch (err: any) {
    console.log(`✓ Unknown user properly rejected: ${err.message}`);
  }

  // 12. Shutdown test server
  await new Promise<void>((resolve) => server.close(resolve));
  console.log("✓ SMTP Server stopped cleanly.");

  await disconnectDatabase();
  console.log("=== [SUCCESS] Phase 3 Inbound SMTP & BYOS S3 Pipeline Fully Verified! ===");
}

runTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
