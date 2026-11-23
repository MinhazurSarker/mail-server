import { connectToDatabase, disconnectDatabase, OrganizationModel, DomainModel, UserModel, MailboxStateModel, MessageModel, MessageBodyModel, ContactModel, CalendarEventModel } from "@cellsinbox/db";
import { OrganizationService, DomainService, UserService } from "../src/index.js";

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
    const created = await UserService.createUser({
      organizationId: orgId,
      domainId: domain._id.toString(),
      email: "minhazur@cellsweb.com",
      displayName: "Minhazur Rahman",
      role: "ORG_ADMIN",
    });
    user = created.user;
    // Set permanent password and active status
    await UserService.changePassword(user._id.toString(), created.temporaryPassword, "Password123!");
    user.status = "ACTIVE";
    user.role = "ORG_ADMIN";
    user.preferences = {
      autoSaveDrafts: true,
      sendReadReceipts: false,
      desktopNotifications: true,
      defaultToHtml: true,
      signature: "-- \nMinhazur Rahman\nLead Architect @ CellsWeb",
    };
    await user.save();
  } else {
    user.status = "ACTIVE";
    user.role = "ORG_ADMIN";
    await user.save();
  }
  console.log(`✓ Admin user ready: ${user.email} (Password: Password123!)`);

  // 4. Seed sample messages in Inbox
  const existingMsg = await MessageModel.findOne({ organizationId: org._id });
  if (!existingMsg) {
    const msg = new MessageModel({
      organizationId: org._id,
      messageId: `<seed-${Date.now()}@gmail.com>`,
      from: { name: "Minhazur (Personal)", address: "minhazursarker12052002@gmail.com" },
      to: [{ name: "Minhazur Rahman", address: "minhazur@cellsweb.com" }],
      subject: "Welcome to Sovereign CellsInbox 🚀",
      date: new Date(),
      s3RawKey: "blobs/seed-welcome.eml",
      sizeBytes: 2048,
      hasAttachments: false,
      spfResult: "PASS",
      dkimResult: "PASS",
      dmarcResult: "PASS",
    });
    await msg.save();

    const body = new MessageBodyModel({
      messageId: msg._id,
      text: "Hello Minhazur,\n\nWelcome to your sovereign self-hosted CellsInbox deployment! Everything is running securely on Node.js and MongoDB.\n\nBest regards,\nCellsInbox Team",
      html: "<p>Hello Minhazur,</p><p>Welcome to your sovereign self-hosted <strong>CellsInbox</strong> deployment! Everything is running securely on Node.js and MongoDB.</p><p>Best regards,<br/><strong>CellsInbox Team</strong></p>",
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
        organizationId: org._id,
        userId: user._id,
        name: "Minhazur Sarker (Gmail)",
        email: "minhazursarker12052002@gmail.com",
        phone: "+8801700000000",
        company: "Personal",
        notes: "Primary personal Google Workspace / Gmail account",
        isFavorite: true,
      },
      {
        organizationId: org._id,
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
      organizationId: org._id,
      userId: user._id,
      title: "CellsInbox Production Launch Review",
      description: "Final walkthrough of the sovereign email stack and live deliverability testing.",
      startTime: start,
      endTime: end,
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
