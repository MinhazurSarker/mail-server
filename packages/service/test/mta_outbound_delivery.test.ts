import { SMTPServer } from "smtp-server";
import { simpleParser, type ParsedMail } from "mailparser";
import {
  connectToDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
  MessageModel,
  DeliveryQueueModel,
} from "@cellsinbox/db";
import { DomainService, UserService, MailService, MtaService } from "../src/index.js";

async function run() {
  console.log("=== [TEST] Starting Phase 5 Outbound MTA & DKIM Signing Verification ===");
  await connectToDatabase();
  console.log("✓ Connected to MongoDB");

  const orgSlug = `mta-test-${Date.now()}`;
  const senderDomain = `${orgSlug}.org`;
  const senderEmail = `ceo@${senderDomain}`;
  const externalRecipient = `partner@external-corp.com`;

  const receivedMails: ParsedMail[] = [];
  const rawHeadersList: string[] = [];

  // 1. Start Mock Inbound SMTP Server on Port 2527
  const mockSmtpServer = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS", "AUTH"],
    onData(stream, _session, callback) {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", async () => {
        const fullBuffer = Buffer.concat(chunks);
        rawHeadersList.push(fullBuffer.toString("utf-8"));
        const parsed = await simpleParser(fullBuffer);
        receivedMails.push(parsed);
        callback(null);
      });
    },
  });

  await new Promise<void>((resolve) => {
    mockSmtpServer.listen(2527, "127.0.0.1", () => {
      console.log("✓ Mock SMTP Receiver listening on 127.0.0.1:2527");
      resolve();
    });
  });

  try {
    // 2. Create Tenant Organization & Domain with 2048-bit DKIM Key
    const org = await OrganizationModel.create({
      name: "MTA Outbound Corp",
      slug: orgSlug,
      status: "ACTIVE",
      tier: "ENTERPRISE",
    });

    const domain = await DomainService.addDomain(org._id.toString(), senderDomain);
    console.log(`✓ Domain created: ${domain.name} (DKIM selector: ${domain.dkimSelector}, key length: 2048-bit)`);

    // 3. Create Mailbox User
    const { user: senderUser } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: senderEmail,
      displayName: "Chief Executive Officer",
      role: "MAILBOX_USER",
    });
    console.log(`✓ Sender mailbox user created: ${senderUser.email}`);

    // 4. Send email targeting external recipient (Queued for MTA Outbound)
    const sendResult = await MailService.sendMail({
      userId: senderUser._id.toString(),
      to: [externalRecipient],
      subject: "Partnership Agreement Q4 2026",
      text: "Please find our signed partnership agreement enclosed for counter-signature.",
      html: "<p>Please find our <strong>signed partnership agreement</strong> enclosed for counter-signature.</p>",
    });

    if (sendResult.queuedOutbound !== 1 || sendResult.deliveredInternally !== 0) {
      throw new Error(`Expected queuedOutbound=1, got queuedOutbound=${sendResult.queuedOutbound}, deliveredInternally=${sendResult.deliveredInternally}`);
    }
    console.log(`✓ Outbound message queued successfully (queuedOutbound: 1)`);

    // 5. Verify queue document created in DeliveryQueueModel
    const queueItem = await DeliveryQueueModel.findOne({
      organizationId: org._id,
      recipient: externalRecipient,
    });
    if (!queueItem || queueItem.status !== "PENDING") {
      throw new Error(`Queue item not in PENDING state: ${queueItem?.status}`);
    }
    console.log(`✓ DeliveryQueue document verified: id=${queueItem._id}, status=${queueItem.status}`);

    // 6. Execute MTA Outbound Dispatch with override to local mock SMTP port 2527
    const dispatchResult = await MtaService.deliverQueueItem(queueItem._id.toString(), {
      overrideMxHost: "127.0.0.1",
      overrideMxPort: 2527,
    });

    if (!dispatchResult.success) {
      throw new Error(`MtaService dispatch failed: ${dispatchResult.error}`);
    }
    if (!dispatchResult.dkimSigned) {
      throw new Error("Expected dispatch to be DKIM signed with domain private key");
    }
    console.log(`✓ MTA Outbound dispatch executed successfully (DKIM signed: ${dispatchResult.dkimSigned})`);

    // 7. Verify received message on Mock SMTP Server
    if (receivedMails.length !== 1) {
      throw new Error(`Expected 1 email received on mock server, got ${receivedMails.length}`);
    }
    const received = receivedMails[0];
    const rawContent = rawHeadersList[0];

    if (received.subject !== "Partnership Agreement Q4 2026") {
      throw new Error(`Subject mismatch on receiver: ${received.subject}`);
    }
    if (!received.text?.includes("partnership agreement enclosed")) {
      throw new Error("Body text mismatch on receiver");
    }
    if (received.from?.value[0]?.address !== senderEmail) {
      throw new Error(`From address mismatch: expected ${senderEmail}, got ${received.from?.value[0]?.address}`);
    }
    if (received.to && (Array.isArray(received.to) ? received.to[0].value[0].address : received.to.value[0].address) !== externalRecipient) {
      throw new Error("Recipient address mismatch on receiver");
    }

    // 8. Cryptographic DKIM Header Verification
    const hasDkimSignature = rawContent.toLowerCase().includes("dkim-signature:");
    if (!hasDkimSignature) {
      throw new Error("DKIM-Signature header missing from delivered email!");
    }
    const hasCorrectSelector = rawContent.includes("s=ci");
    const hasCorrectDomain = rawContent.includes(`d=${senderDomain}`);
    if (!hasCorrectSelector || !hasCorrectDomain) {
      throw new Error(`DKIM header missing correct selector (s=ci) or domain (d=${senderDomain})`);
    }
    console.log(`✓ Cryptographic DKIM-Signature verified on wire! (selector: s=ci, domain: d=${senderDomain})`);

    // 9. Verify Queue item status updated to DELIVERED
    const updatedQueueItem = await DeliveryQueueModel.findById(queueItem._id);
    if (!updatedQueueItem || updatedQueueItem.status !== "DELIVERED" || updatedQueueItem.attempts !== 1) {
      throw new Error(`Expected status DELIVERED and attempts=1, got status=${updatedQueueItem?.status}, attempts=${updatedQueueItem?.attempts}`);
    }
    console.log(`✓ DeliveryQueue status verified: DELIVERED (attempts: ${updatedQueueItem.attempts})`);

    // 10. Test Failure & Exponential Backoff
    const failQueueItem = new DeliveryQueueModel({
      organizationId: org._id,
      messageId: queueItem.messageId,
      sender: senderEmail,
      recipient: "test-unreachable@failed-domain.com",
      status: "PENDING",
      attempts: 0,
      nextAttemptAt: new Date(),
    });
    await failQueueItem.save();

    const failResult = await MtaService.deliverQueueItem(failQueueItem._id.toString(), {
      overrideMxHost: "127.0.0.1",
      overrideMxPort: 19999, // unreachable port
    });

    if (failResult.success !== false) {
      throw new Error("Expected delivery to unreachable port to fail");
    }

    const recordedFailed = await DeliveryQueueModel.findById(failQueueItem._id);
    if (!recordedFailed || recordedFailed.status !== "FAILED" || recordedFailed.attempts !== 1) {
      throw new Error(`Expected status FAILED, got ${recordedFailed?.status}`);
    }
    if (recordedFailed.nextAttemptAt.getTime() <= Date.now()) {
      throw new Error("Expected nextAttemptAt to be set into the future via exponential backoff");
    }
    console.log(`✓ Unreachable port failure & exponential backoff verified (status: ${recordedFailed.status}, nextAttempt in future: true)`);

    console.log("\n=======================================================");
    console.log("  ALL PHASE 5 MTA OUTBOUND & DKIM TESTS PASSED!       ");
    console.log("=======================================================\n");

    // Cleanup
    await OrganizationModel.deleteMany({ _id: org._id });
    await DomainModel.deleteMany({ organizationId: org._id });
    await UserModel.deleteMany({ organizationId: org._id });
    await MessageModel.deleteMany({ organizationId: org._id });
    await DeliveryQueueModel.deleteMany({ organizationId: org._id });
  } finally {
    await new Promise<void>((resolve) => {
      mockSmtpServer.close(() => {
        console.log("✓ Mock SMTP Receiver stopped cleanly.");
        resolve();
      });
    });
    await disconnectDatabase();
  }
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
