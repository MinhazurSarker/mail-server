import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  connectToDatabase,
  disconnectDatabase,
  OrganizationModel,
  DomainModel,
  UserModel,
  ContactModel,
  CalendarEventModel,
} from "@cellsinbox/db";
import {
  OrganizationService,
  UserService,
  ContactService,
  CalendarService,
} from "../src/index.js";

describe("Phase 9: Enterprise Contacts & Calendar Engine Flow", () => {
  let testOrgId: string;
  let testDomainId: string;
  let testUserId: string;

  let createdContactId: string;
  let createdEventId: string;

  before(async () => {
    await connectToDatabase();

    const org = await OrganizationService.createOrganization({
      name: "Phase 9 Test Organization",
      slug: `p9-org-${Date.now()}`,
    });
    testOrgId = org._id.toString();

    const domain = new DomainModel({
      organizationId: org._id,
      name: `p9-${Date.now()}.local`,
      verificationToken: "token_p9",
      dkimSelector: "ci",
      dkimPrivateKey: "private_key",
      dkimPublicKey: "public_key",
      isVerified: true,
    });
    const savedDomain = await domain.save();
    testDomainId = savedDomain._id.toString();

    const createdUser = await UserService.createUser({
      organizationId: testOrgId,
      domainId: testDomainId,
      email: `user-p9-${Date.now()}@p9.local`,
      displayName: "P9 Test User",
      role: "MAILBOX_USER",
    });
    testUserId = createdUser.user._id.toString();
  });

  after(async () => {
    if (testOrgId) {
      await ContactModel.deleteMany({ organizationId: testOrgId });
      await CalendarEventModel.deleteMany({ organizationId: testOrgId });
      await UserModel.deleteMany({ organizationId: testOrgId });
      await DomainModel.deleteMany({ organizationId: testOrgId });
      await OrganizationModel.findByIdAndDelete(testOrgId);
    }
    await disconnectDatabase();
  });

  describe("ContactService (Address Book & Autocomplete)", () => {
    it("should create new contacts for the mailbox user", async () => {
      const contact1 = await ContactService.createContact(testUserId, {
        name: "Barbara Walters",
        email: "barbara@acme.com",
        phone: "+1 555-0100",
        company: "Acme Corp",
        jobTitle: "Lead Anchor",
        isFavorite: true,
      });

      const contact2 = await ContactService.createContact(testUserId, {
        name: "Bob Jones",
        email: "bob.jones@initech.io",
        company: "Initech",
      });

      assert.ok(contact1._id);
      assert.equal(contact1.name, "Barbara Walters");
      assert.equal(contact1.isFavorite, true);

      assert.ok(contact2._id);
      assert.equal(contact2.name, "Bob Jones");

      createdContactId = contact1._id.toString();
    });

    it("should list contacts with filtering and favorites", async () => {
      const all = await ContactService.listContacts(testUserId);
      assert.equal(all.total, 2);

      const favs = await ContactService.listContacts(testUserId, { favoriteOnly: true });
      assert.equal(favs.total, 1);
      assert.equal(favs.items[0].email, "barbara@acme.com");

      const searched = await ContactService.listContacts(testUserId, { search: "initech" });
      assert.equal(searched.total, 1);
      assert.equal(searched.items[0].name, "Bob Jones");
    });

    it("should provide fast autocomplete for compose recipient input", async () => {
      const suggestions = await ContactService.searchAutocomplete(testUserId, "bar");
      assert.equal(suggestions.length, 1);
      assert.equal(suggestions[0].name, "Barbara Walters");
      assert.equal(suggestions[0].email, "barbara@acme.com");

      const recents = await ContactService.searchAutocomplete(testUserId, "");
      assert.equal(recents.length, 2);
    });

    it("should update contact details", async () => {
      const updated = await ContactService.updateContact(createdContactId, testUserId, {
        jobTitle: "Senior Managing Editor",
        notes: "Key executive contact for press releases.",
      });

      assert.equal(updated.jobTitle, "Senior Managing Editor");
      assert.equal(updated.notes, "Key executive contact for press releases.");
    });

    it("should delete contact", async () => {
      await ContactService.deleteContact(createdContactId, testUserId);
      const remaining = await ContactService.listContacts(testUserId);
      assert.equal(remaining.total, 1);
      assert.equal(remaining.items[0].name, "Bob Jones");
    });
  });

  describe("CalendarService (Events, Scheduling & Invitations)", () => {
    it("should schedule a new calendar event with attendees", async () => {
      const start = new Date("2026-11-25T14:00:00Z");
      const end = new Date("2026-11-25T15:30:00Z");

      const event = await CalendarService.createEvent(testUserId, {
        title: "Q4 Architecture Alignment",
        description: "Reviewing sovereign mail server milestones",
        location: "Virtual Room Alpha",
        startTime: start,
        endTime: end,
        color: "#10b981",
        attendees: [
          { email: "alice@partner.com", name: "Alice Partner" },
          { email: "dev@company.com" },
        ],
      });

      assert.ok(event._id);
      assert.equal(event.title, "Q4 Architecture Alignment");
      assert.equal(event.attendees.length, 2);
      assert.equal(event.attendees[0].status, "NEEDS_ACTION");

      createdEventId = event._id.toString();
    });

    it("should query events within a specific time window", async () => {
      const startWindow = new Date("2026-11-01T00:00:00Z");
      const endWindow = new Date("2026-11-30T23:59:59Z");

      const events = await CalendarService.listEvents(testUserId, {
        startRange: startWindow,
        endRange: endWindow,
      });

      assert.equal(events.length, 1);
      assert.equal(events[0].title, "Q4 Architecture Alignment");
      assert.equal(events[0].location, "Virtual Room Alpha");
    });

    it("should update attendee invitation response", async () => {
      const event = await CalendarService.respondToInvite(
        createdEventId,
        "alice@partner.com",
        "ACCEPTED",
      );

      const attendee = event.attendees.find((a) => a.email === "alice@partner.com");
      assert.ok(attendee);
      assert.equal(attendee.status, "ACCEPTED");
    });

    it("should update event title and duration", async () => {
      const newEnd = new Date("2026-11-25T16:00:00Z");
      const updated = await CalendarService.updateEvent(createdEventId, testUserId, {
        title: "Q4 Architecture Alignment (Extended)",
        endTime: newEnd,
      });

      assert.equal(updated.title, "Q4 Architecture Alignment (Extended)");
      assert.equal(new Date(updated.endTime).getTime(), newEnd.getTime());
    });

    it("should delete calendar event", async () => {
      await CalendarService.deleteEvent(createdEventId, testUserId);

      const remaining = await CalendarService.listEvents(testUserId, {
        startRange: new Date("2026-11-01T00:00:00Z"),
        endRange: new Date("2026-11-30T23:59:59Z"),
      });

      assert.equal(remaining.length, 0);
    });
  });
});
