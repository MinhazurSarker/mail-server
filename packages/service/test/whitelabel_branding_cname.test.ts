import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { connectToDatabase, disconnectDatabase, OrganizationModel, DomainModel } from "@cellsinbox/db";
import { OrganizationService, DomainService } from "../src/index.js";

describe("White-Label Multi-Tenant Branding & Custom CNAME Resolution Flow", () => {
  let orgId: string;
  const testSlug = `whitelabel-org-${Date.now()}`;
  const testDomain = `acme-${Date.now()}.com`;

  before(async () => {
    await connectToDatabase();
    // Clean up any test remnants
    await OrganizationModel.deleteMany({ slug: new RegExp(testSlug) });
    await DomainModel.deleteMany({ name: new RegExp("acme-") });
  });

  after(async () => {
    await OrganizationModel.deleteMany({ slug: new RegExp(testSlug) });
    await DomainModel.deleteMany({ name: new RegExp("acme-") });
    await disconnectDatabase();
  });

  it("should create an active organization and verified domain", async () => {
    const org = await OrganizationService.createOrganization({
      name: "Acme Enterprise Corp",
      slug: testSlug,
    });
    orgId = org._id.toString();
    await OrganizationService.updateStatus(orgId, "ACTIVE");

    const domain = await DomainService.addDomain(orgId, testDomain);
    domain.isVerified = true;
    await domain.save();
    assert.equal(domain.name, testDomain);
  });

  it("should configure custom branding and custom CNAME domains", async () => {
    const customCname = `webmail.${testDomain}`;
    const secondaryCname = `mail.partner-${Date.now()}.org`;

    const updated = await OrganizationService.updateBranding(
      orgId,
      {
        companyName: "Acme Global Solutions",
        logoUrl: "https://acme.example.com/assets/logo.svg",
        faviconUrl: "https://acme.example.com/favicon.ico",
        primaryColor: "#0284c7",
      },
      [customCname, secondaryCname],
    );

    assert.equal(updated.branding?.companyName, "Acme Global Solutions");
    assert.equal(updated.branding?.logoUrl, "https://acme.example.com/assets/logo.svg");
    assert.equal(updated.customWebmailDomains?.length, 2);
    assert.ok(updated.customWebmailDomains?.includes(customCname.toLowerCase()));
  });

  it("should resolve default CellsInbox branding for system domains", async () => {
    const defaultHosts = ["localhost", "127.0.0.1", "cellsweb.com", "webmail.cellsweb.com", "mail.cellsweb.com"];

    for (const host of defaultHosts) {
      const branding = await OrganizationService.resolveBrandingByHost(host);
      assert.equal(branding.isCustom, false, `Expected false for host ${host}`);
      assert.equal(branding.name, "CellsInbox");
      assert.equal(branding.logoUrl, undefined);
    }
  });

  it("should resolve custom white-label branding by exact CNAME domain", async () => {
    const customCname = `webmail.${testDomain}`;
    const branding = await OrganizationService.resolveBrandingByHost(customCname);

    assert.equal(branding.isCustom, true);
    assert.equal(branding.name, "Acme Global Solutions");
    assert.equal(branding.logoUrl, "https://acme.example.com/assets/logo.svg");
    assert.equal(branding.primaryColor, "#0284c7");
    assert.equal(branding.webmailHost, customCname);
  });

  it("should resolve custom branding via tenant registered base domain fallback", async () => {
    // Visiting "mail.<tenantDomain>" without explicit customWebmailDomain configured
    const subdomain = `mail.${testDomain}`;
    const branding = await OrganizationService.resolveBrandingByHost(subdomain);

    assert.equal(branding.isCustom, true);
    assert.equal(branding.name, "Acme Global Solutions");
    assert.equal(branding.logoUrl, "https://acme.example.com/assets/logo.svg");
  });

  it("should fall back gracefully to CellsInbox for unknown third-party domains", async () => {
    const unknownHost = "webmail.someunregisteredcompany.xyz";
    const branding = await OrganizationService.resolveBrandingByHost(unknownHost);

    assert.equal(branding.isCustom, false);
    assert.equal(branding.name, "CellsInbox");
    assert.equal(branding.logoUrl, undefined);
  });
});
