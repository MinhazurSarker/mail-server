import argon2 from "argon2";
import { connectToDatabase, disconnectDatabase, OrganizationModel, DomainModel, UserModel, MailboxStateModel, MessageModel, MessageBodyModel, ContactModel, CalendarEventModel } from "../packages/db/dist/index.js";
import { OrganizationService, DomainService } from "../packages/service/dist/index.js";

async function seed() {
  await connectToDatabase();
  console.log("Connected to MongoDB for seeding...");

  // 1. Ensure Organization
  let org = await OrganizationModel.findOne({ slug: "cellsweb" });
  if (!org) {
    org = await OrganizationService.createOrganization({
      name: "CellsWeb Technologies",
      slug: "cellsweb",
    });
  }
  org.status = "ACTIVE";
  org.branding = {
    companyName: "CellsWeb Sovereign Mail",
    logoUrl: "https://cellsweb.com/logo.png",
    primaryColor: "#0284c7",
  };
  org.customWebmailDomains = ["webmail.cellsweb.com"];
  await org.save();
  const orgId = org._id.toString();
  console.log(`✓ Organization ready: ${org.name} (${orgId})`);

  // 2. Ensure Domain cellsweb.com
  let domain = await DomainModel.findOne({ name: "cellsweb.com" });
  if (!domain) {
    domain = await DomainService.addDomain(orgId, "cellsweb.com");
  }
  domain.isVerified = true;
  domain.mxStatus = "VERIFIED";
  domain.spfStatus = "VERIFIED";
  domain.dkimStatus = "VERIFIED";
  domain.dmarcStatus = "VERIFIED";
  await domain.save();
  console.log(`✓ Domain ready: cellsweb.com`);

  // 3. Ensure Admin User: minhazur@cellsweb.com
  let user = await UserModel.findOne({ email: "minhazur@cellsweb.com" });
  if (!user) {
    const hash = await argon2.hash("Password123!");
    user = new UserModel({
      organizationId: org._id,
      domainId: domain._id,
      email: "minhazur@cellsweb.com",
      displayName: "Minhazur Rahman",
      passwordHash: hash,
      role: "ORG_ADMIN",
      status: "ACTIVE", // Bypass first-time onboarding for direct UI testing
      allowedSendingDomains: ["cellsweb.com"],
      maxStorageBytes: 10737418240, // 10 GB
      usedStorageBytes: 104857600, // 100 MB
      preferences: {
        autoSaveDrafts: true,
        sendReadReceipts: false,
        desktopNotifications: true,
        defaultToHtml: true,
        signature: "-- \nMinhazur Rahman\nLead Architect @ CellsWeb",
      },
    });
    await user.save();
  } else {
    user.status = "ACTIVE";
    user.role = "ORG_ADMIN";
    user.passwordHash = await argon2.hash("Password123!");
    await user.save();
  }
  const userId = user._id.toString();
  console.log(`✓ Admin user ready: ${user.email} (Password: Password123!)`);

  // 4. Seed sample messages in Inbox
  const existingMsg = await MessageModel.findOne({ organizationId: org._id });
  if (!existingMsg) {
    const msg = new MessageModel({
      organizationId: org._id,
      domainId: domain._id,
      envelopeFrom: "minhazursarker12052002@gmail.com",
      envelopeRecipients: ["minhazur@cellsweb.com"],
      sender: { name: "Minhazur (Personal)", email: "minhazursarker12052002@gmail.com" },
      recipients: [{ name: "Minhazur Rahman", email: "minhazur@cellsweb.com" }],
      subject: "Welcome to Sovereign CellsInbox 🚀",
      date: new Date(),
      messageIdHeader: `<seed-${Date.now()}@gmail.com>`,
      s3RawMimeKey: "blobs/seed-welcome.eml",
      sizeBytes: 2048,
      spfStatus: "PASS",
      dkimStatus: "PASS",
      dmarcStatus: "PASS",
    });
    await msg.save();

    const body = new MessageBodyModel({
      messageId: msg._id,
      textBody: "Hello Minhazur,\n\nWelcome to your sovereign self-hosted CellsInbox deployment! Everything is running securely on Node.js and MongoDB.\n\nBest regards,\nCellsInbox Team",
      htmlBody: "<p>Hello Minhazur,</p><p>Welcome to your sovereign self-hosted <strong>CellsInbox</strong> deployment! Everything is running securely on Node.js and MongoDB.</p><p>Best regards,<br/><strong>CellsInbox Team</strong></p>",
      snippet: "Welcome to your sovereign self-hosted CellsInbox deployment! Everything is running...",
    });
    await body.save();

    const mailboxState = new MailboxStateModel({
      userId: user._id,
      messageId: msg._id,
      folder: "INBOX",
      isRead: false,
      isStarred: true,
    });
    await mailboxState.save();
    console.log("✓ Sample inbox message created");
  }

  // 5. Seed sample contacts
  const existingContact = await ContactModel.findOne({ userId: user._id });
  if (!existingContact) {
    await ContactModel.create([
      {
        userId: user._id,
        name: "Minhazur Sarker (Gmail)",
        email: "minhazursarker12052002@gmail.com",
        phone: "+8801700000000",
        company: "Personal",
        notes: "Primary personal Google Workspace / Gmail account",
        isFavorite: true,
      },
      {
        userId: user._id,
        name: "Dev Support Team",
        email: "support@cellsweb.com",
        phone: "+8801800000000",
        company: "CellsWeb",
        notes: "Internal support channel",
        isFavorite: false,
      },
    ]);
    console.log("✓ Sample contacts created");
  }

  // 6. Seed sample calendar event
  const existingEvent = await CalendarEventModel.findOne({ userId: user._id });
  if (!existingEvent) {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0);
    await CalendarEventModel.create({
      userId: user._id,
      title: "CellsInbox Production Launch Review",
      description: "Final walkthrough of the sovereign email stack and live deliverability testing.",
      start,
      end,
      allDay: false,
      location: "Virtual Meeting Room",
      color: "#0284c7",
      attendees: [
        { email: "minhazur@cellsweb.com", name: "Minhazur Rahman", status: "ACCEPTED" },
        { email: "minhazursarker12052002@gmail.com", name: "Minhazur Sarker", status: "ACCEPTED" },
      ],
    });
    console.log("✓ Sample calendar event scheduled");
  }

  await disconnectDatabase();
  console.log("🎉 Seeding complete! Login credentials: minhazur@cellsweb.com / Password123!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
