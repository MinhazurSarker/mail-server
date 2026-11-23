import {
  connectToDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
  ApiKeyModel,
  DeliveryQueueModel,
  MessageModel,
} from "@cellsinbox/db";
import {
  DomainService,
  UserService,
  ApiKeyService,
  OrganizationService,
} from "../src/index.js";

async function run() {
  console.log("=== [TEST] Starting Phase 6: API Key Sending & Admin Flow Verification ===");
  await connectToDatabase();
  console.log("✓ Connected to MongoDB");

  const orgSlug = `api-test-${Date.now()}`;
  const allowedDomainName = `${orgSlug}.com`;
  const forbiddenDomainName = `fake-${orgSlug}.com`;

  try {
    // 1. Create Organization & Domain
    const org = await OrganizationModel.create({
      name: "API Test Organization",
      slug: orgSlug,
      status: "ACTIVE",
    });
    console.log(`✓ Organization created: ${org.name}`);

    const domain = await DomainService.addDomain(org._id.toString(), allowedDomainName);
    console.log(`✓ Domain added: ${domain.name} (DKIM selector: ${domain.dkimSelector})`);

    // 2. Create User
    const { user } = await UserService.createUser({
      organizationId: org._id.toString(),
      domainId: domain._id.toString(),
      email: `developer@${allowedDomainName}`,
      displayName: "Backend Developer",
      role: "ORG_ADMIN",
    });
    console.log(`✓ User created: ${user.email}`);

    // 3. Generate SendGrid-Style API Key with domain scope & rate limit
    const { apiKey, rawSecretKey } = await ApiKeyService.createApiKey({
      organizationId: org._id.toString(),
      userId: user._id.toString(),
      name: "Transactional Backend Sender",
      allowedDomains: [allowedDomainName],
      rateLimitPerMinute: 3, // allows 3 requests per min
    });

    if (!rawSecretKey.startsWith("ci_live_")) {
      throw new Error(`Expected raw secret key to start with 'ci_live_', got: ${rawSecretKey}`);
    }
    console.log(`✓ Generated API key: prefix=${apiKey.keyPrefix}... (secret: ci_live_****************)`);

    // 4. Validate API Key validation mechanism
    const validatedKey = await ApiKeyService.validateApiKey(rawSecretKey);
    if (validatedKey._id.toString() !== apiKey._id.toString()) {
      throw new Error("Validated API key ID does not match created key ID");
    }
    console.log(`✓ Validated raw API key via Argon2 cryptographic verification`);

    // 5. Test Domain Enforcement (Unauthorized domain should be rejected)
    let domainCheckBlocked = false;
    try {
      await ApiKeyService.sendProgrammaticEmail({
        apiKey: validatedKey,
        from: `spoofer@${forbiddenDomainName}`,
        to: ["customer@testrecipient.com"],
        subject: "Phishing Attempt",
        text: "This should be blocked.",
      });
    } catch (err: any) {
      if (err.message.includes("Unauthorized sender domain")) {
        domainCheckBlocked = true;
      }
    }

    if (!domainCheckBlocked) {
      throw new Error("Expected unauthorized sender domain to be rejected!");
    }
    console.log(`✓ Sender domain authorization enforced (rejected spoofed domain '${forbiddenDomainName}')`);

    // 6. Test Authorized Programmatic Email Sending (with attachment)
    const sendResult1 = await ApiKeyService.sendProgrammaticEmail({
      apiKey: validatedKey,
      from: `notifications@${allowedDomainName}`,
      fromName: "Automated Orders",
      to: ["customer@testrecipient.com"],
      subject: "Order Confirmation #8831",
      text: "Thank you for your order! Your receipt is attached.",
      html: "<p>Thank you for your order! Your receipt is attached.</p>",
      attachments: [
        {
          filename: "receipt.txt",
          content: Buffer.from("Receipt #8831: Paid $99.00 USD").toString("base64"),
          contentType: "text/plain",
        },
      ],
    });

    if (sendResult1.queuedOutbound !== 1) {
      throw new Error(`Expected queuedOutbound=1, got: ${sendResult1.queuedOutbound}`);
    }
    console.log(`✓ Authorized programmatic email dispatched & queued for MTA (messageId: ${sendResult1.messageId})`);

    // 7. Verify Message and Queue documents created
    const queuedItem = await DeliveryQueueModel.findOne({
      organizationId: org._id,
      recipient: "customer@testrecipient.com",
    });
    if (!queuedItem || queuedItem.status !== "PENDING") {
      throw new Error(`Queue item not in PENDING state: ${queuedItem?.status}`);
    }
    console.log(`✓ Verified outbound queue record: recipient=${queuedItem.recipient}, status=${queuedItem.status}`);

    // 8. Test Rate Limit Enforcement (configured limit is 3 per minute)
    // 4th request should exceed rate limit:
    let rateLimitTriggered = false;
    try {
      await ApiKeyService.validateApiKey(rawSecretKey);
    } catch (err: any) {
      if (err.message.includes("Rate limit exceeded")) {
        rateLimitTriggered = true;
      }
    }

    if (!rateLimitTriggered) {
      throw new Error("Expected rate limit to be triggered on 4th request within 1 minute window");
    }
    console.log(`✓ Rate limit threshold enforced (rejected request exceeding 3 req/min limit)`);

    // 9. Test Secondary Amazon SES Backup Connector Configuration
    const updatedOrg = await OrganizationService.updateSesBackupConfig(org._id.toString(), {
      enabled: true,
      region: "us-east-1",
      accessKeyId: "AKIA_MOCK_SES_BACKUP_KEY",
      secretAccessKey: "SECRET_MOCK_SES_BACKUP_KEY",
      fromEmail: `backup-relay@${allowedDomainName}`,
    });

    if (
      !updatedOrg.sesBackupConfig?.enabled ||
      updatedOrg.sesBackupConfig.region !== "us-east-1" ||
      updatedOrg.sesBackupConfig.fromEmail !== `backup-relay@${allowedDomainName}`
    ) {
      throw new Error("Failed to save secondary Amazon SES connector configuration");
    }
    console.log(`✓ Secondary Amazon SES backup connector saved (region: ${updatedOrg.sesBackupConfig.region}, enabled: ${updatedOrg.sesBackupConfig.enabled})`);

    // 10. Test Revoking API Key
    const revoked = await ApiKeyService.revokeApiKey({
      apiKeyId: apiKey._id.toString(),
      organizationId: org._id.toString(),
      userId: user._id.toString(),
    });

    if (!revoked) {
      throw new Error("Failed to revoke API key");
    }

    let validationAfterRevokeFailed = false;
    try {
      await ApiKeyService.validateApiKey(rawSecretKey);
    } catch (err: any) {
      if (err.message.includes("Invalid or revoked API key")) {
        validationAfterRevokeFailed = true;
      }
    }

    if (!validationAfterRevokeFailed) {
      throw new Error("Revoked API key was still accepted by validateApiKey");
    }
    console.log(`✓ Revoked API key successfully rejected on subsequent access`);

    console.log("\n=======================================================");
    console.log("  ALL PHASE 6 API KEY & ADMIN TESTS PASSED!            ");
    console.log("=======================================================\n");

    // Cleanup
    await OrganizationModel.deleteMany({ _id: org._id });
    await DomainModel.deleteMany({ organizationId: org._id });
    await UserModel.deleteMany({ organizationId: org._id });
    await ApiKeyModel.deleteMany({ organizationId: org._id });
    await MessageModel.deleteMany({ organizationId: org._id });
    await DeliveryQueueModel.deleteMany({ organizationId: org._id });
  } finally {
    await disconnectDatabase();
  }
}

run().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
