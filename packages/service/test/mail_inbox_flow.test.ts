import {
  connectToDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
  MailboxStateModel,
  MessageModel,
} from "@cellsinbox/db";
import { MailService, MailEvents, DomainService, UserService } from "../src/index.js";

async function run() {
  console.log("=== [TEST] Starting Phase 4 Mailbox & Reader Flow Verification ===");
  await connectToDatabase();
  console.log("✓ Connected to MongoDB");

  const orgSlug = `test-p4-${Date.now()}`;
  const domainName = `${orgSlug}.local`;
  const senderEmail = `user-${Date.now()}@${domainName}`;
  const recipientEmail = `recipient-${Date.now()}@${domainName}`;

  try {
    // 1. Create Organization & Domain
    const org = await OrganizationModel.create({
      name: "Phase 4 Test Org",
      slug: orgSlug,
      status: "ACTIVE",
      tier: "PRO",
    });
    console.log(`✓ Organization created: ${org.name} (${org._id})`);

    const domain = await DomainService.addDomain(org._id.toString(), domainName);
    console.log(`✓ Domain created: ${domain.name}`);

    // 2. Create Users via UserService
    const { user: senderUser } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: senderEmail,
      displayName: "Sender User",
      role: "MAILBOX_USER",
    });

    const { user: recipientUser } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: recipientEmail,
      displayName: "Recipient User",
      role: "MAILBOX_USER",
    });
    console.log(`✓ Created test users: ${senderEmail} and ${recipientEmail}`);

    // 3. Test Inbound Ingestion & Real-Time Event
    let eventReceived = false;
    MailEvents.onMailReceived((event) => {
      if (event.userId === senderUser._id.toString()) {
        eventReceived = true;
      }
    });

    const rawMime = Buffer.from(
      `From: external-partner@sender.com\r\n` +
      `To: ${senderEmail}\r\n` +
      `Subject: Quarterly Report Q4 2026\r\n` +
      `Date: Sun, 22 Nov 2026 12:00:00 +0000\r\n` +
      `Content-Type: text/plain; charset=utf-8\r\n` +
      `\r\n` +
      `Hello! Please find the quarterly metrics and performance numbers attached for review.\r\n`
    );

    const ingested = await MailService.ingestInboundMessage({
      rawMime,
      envelopeFrom: "external-partner@sender.com",
      envelopeRecipients: [senderEmail],
    });

    if (ingested.length !== 1 || ingested[0].subject !== "Quarterly Report Q4 2026") {
      throw new Error("Failed to ingest inbound message");
    }
    console.log(`✓ Inbound email ingested and MailEvents emitted (received: ${eventReceived})`);

    // 4. Test listUserMailbox
    const mailbox = await MailService.listUserMailbox({
      userId: senderUser._id.toString(),
      folder: "INBOX",
      page: 1,
      limit: 10,
    });

    if (mailbox.items.length !== 1) {
      throw new Error(`Expected 1 message in INBOX, got ${mailbox.items.length}`);
    }
    const item = mailbox.items[0];
    if (item.snippet.indexOf("quarterly metrics") === -1) {
      throw new Error(`Expected snippet to contain quarterly metrics, got: "${item.snippet}"`);
    }
    if (item.isRead !== false || mailbox.unreadCount !== 1) {
      throw new Error(`Expected unread message, isRead=${item.isRead}, unreadCount=${mailbox.unreadCount}`);
    }
    console.log(`✓ listUserMailbox verified: 1 unread message with snippet: "${item.snippet}"`);

    // 5. Test getMessageDetails (auto-marks as read)
    const details = await MailService.getMessageDetails({
      userId: senderUser._id.toString(),
      messageId: item.messageId,
      markAsRead: true,
    });

    if (details.subject !== "Quarterly Report Q4 2026") {
      throw new Error(`Subject mismatch in getMessageDetails: ${details.subject}`);
    }
    if (!details.body.text.includes("performance numbers")) {
      throw new Error("Body text missing expected content");
    }
    if (details.isRead !== true) {
      throw new Error("Expected message to be auto-marked as read");
    }

    const statsAfterRead = await MailService.getMailboxStats(senderUser._id.toString());
    if (statsAfterRead.inboxUnread !== 0) {
      throw new Error(`Expected inboxUnread=0 after reading, got: ${statsAfterRead.inboxUnread}`);
    }
    console.log(`✓ getMessageDetails verified: body retrieved and unread count reduced to 0`);

    // 6. Test updateMailboxState (star and trash)
    await MailService.updateMailboxState({
      userId: senderUser._id.toString(),
      messageId: item.messageId,
      isStarred: true,
    });

    let stats = await MailService.getMailboxStats(senderUser._id.toString());
    if (stats.starred !== 1) {
      throw new Error(`Expected starred=1, got: ${stats.starred}`);
    }
    console.log(`✓ Star toggle verified (starred count: ${stats.starred})`);

    await MailService.updateMailboxState({
      userId: senderUser._id.toString(),
      messageId: item.messageId,
      folder: "TRASH",
    });

    stats = await MailService.getMailboxStats(senderUser._id.toString());
    if (stats.trash !== 1 || stats.inboxTotal !== 0) {
      throw new Error(`Expected trash=1, inboxTotal=0, got trash=${stats.trash}, inboxTotal=${stats.inboxTotal}`);
    }
    console.log(`✓ Move to Trash verified (trash count: ${stats.trash}, inboxTotal: ${stats.inboxTotal})`);

    // 7. Test sendMail (internal routing)
    const sendResult = await MailService.sendMail({
      userId: senderUser._id.toString(),
      to: [recipientEmail],
      subject: "Internal Status Sync",
      text: "All systems operational.",
    });

    if (sendResult.deliveredInternally !== 1) {
      throw new Error(`Expected deliveredInternally=1, got ${sendResult.deliveredInternally}`);
    }
    console.log(`✓ sendMail internal routing verified: ${sendResult.deliveredInternally} delivered`);

    const recipientBox = await MailService.listUserMailbox({
      userId: recipientUser._id.toString(),
      folder: "INBOX",
    });
    if (recipientBox.items.length !== 1 || recipientBox.items[0].subject !== "Internal Status Sync") {
      throw new Error("Recipient failed to receive internal message");
    }
    console.log(`✓ Recipient mailbox confirmed delivery: "${recipientBox.items[0].subject}"`);

    const senderSentBox = await MailService.listUserMailbox({
      userId: senderUser._id.toString(),
      folder: "SENT",
    });
    if (senderSentBox.items.length !== 1) {
      throw new Error("Sender SENT folder missing sent message");
    }
    console.log(`✓ Sender SENT folder confirmed: 1 item`);

    console.log("\n=======================================================");
    console.log("  ALL PHASE 4 MAILBOX & READER TESTS PASSED SUCCESSFULLY!  ");
    console.log("=======================================================\n");

    // Cleanup
    await OrganizationModel.deleteMany({ _id: org._id });
    await UserModel.deleteMany({ organizationId: org._id });
    await DomainModel.deleteMany({ organizationId: org._id });
    await MessageModel.deleteMany({ organizationId: org._id });
    await MailboxStateModel.deleteMany({
      userId: { $in: [senderUser._id, recipientUser._id] },
    });
  } finally {
    await disconnectDatabase();
  }
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
