import argon2 from "argon2";
import { OrganizationModel, DomainModel, UserModel, type IOrganization, type IOrganizationBranding, type IDomain, type IUser, isValidObjectId } from "@cellsinbox/db";
import type { StorageConfig } from "@cellsinbox/schema";
import { StorageService } from "./StorageService.js";
import { DomainService } from "./DomainService.js";

export class OrganizationService {
  static async onboardOrganization(data: {
    name: string;
    slug: string;
    domainName: string;
    adminEmail: string;
    adminPassword: string;
    adminDisplayName?: string;
    storageConfig?: any;
  }): Promise<{
    organization: IOrganization;
    domain: IDomain;
    user: IUser;
    userId: string;
    email: string;
    dnsRecords: Array<{
      type: string;
      name: string;
      value: string;
      priority?: number;
      description: string;
    }>;
  }> {
    const cleanSlug = data.slug.toLowerCase().trim();
    const existingOrg = await OrganizationModel.findOne({ slug: cleanSlug });
    if (existingOrg) {
      throw new Error(`Organization slug '${cleanSlug}' is already taken.`);
    }

    const org = new OrganizationModel({
      name: data.name.trim(),
      slug: cleanSlug,
      status: "ACTIVE",
      branding: {
        companyName: data.name.trim(),
      },
      storageConfig: data.storageConfig || { provider: "local_fallback" },
    });
    await org.save();

    const domain = await DomainService.addDomain(org._id.toString(), data.domainName);

    const cleanEmail = data.adminEmail.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new Error(`User with email '${cleanEmail}' already exists.`);
    }

    const passwordHash = await argon2.hash(data.adminPassword);
    const user = new UserModel({
      organizationId: org._id,
      domainId: domain._id,
      email: cleanEmail,
      displayName: data.adminDisplayName || "Administrator",
      passwordHash,
      role: "ORG_ADMIN",
      status: "PENDING_SECURITY_SETUP",
      twoFactorEnforced: true,
    });
    await user.save();

    const dnsRecords = [
      {
        type: "MX",
        name: "@",
        value: "mail.cellsweb.com",
        priority: 10,
        description: "Primary Mail Exchange routing for inbound Port 25 traffic.",
      },
      {
        type: "TXT",
        name: "@",
        value: "v=spf1 mx ~all",
        description: "SPF sender verification allowing this mail server to send on behalf of the domain.",
      },
      {
        type: "TXT",
        name: "ci._domainkey",
        value: `v=DKIM1; k=rsa; p=${domain.dkimPublicKey}`,
        description: "2048-bit RSA DKIM public signing key.",
      },
      {
        type: "TXT",
        name: "_dmarc",
        value: `v=DMARC1; p=reject; rua=mailto:postmaster@${domain.name};`,
        description: "DMARC policy rejecting unauthorized spoofed senders.",
      },
      {
        type: "CNAME",
        name: "webmail",
        value: "webmail.cellsweb.com",
        description: "White-label webmail portal CNAME pointer.",
      },
    ];

    return {
      organization: org,
      domain,
      user,
      userId: user._id.toString(),
      email: user.email,
      dnsRecords,
    };
  }
  static async createOrganization(data: {
    name: string;
    slug: string;
  }): Promise<IOrganization> {
    const existing = await OrganizationModel.findOne({ slug: data.slug.toLowerCase() });
    if (existing) {
      throw new Error(`Organization slug '${data.slug}' is already taken.`);
    }

    const org = new OrganizationModel({
      name: data.name,
      slug: data.slug.toLowerCase(),
      status: "PENDING_APPROVAL",
    });

    return await org.save();
  }

  static async resolveOrg(slugOrId: string): Promise<IOrganization | null> {
    if (!slugOrId) return null;
    if (isValidObjectId(slugOrId)) {
      const byId = await OrganizationModel.findById(slugOrId);
      if (byId) return byId;
    }
    return await OrganizationModel.findOne({ slug: slugOrId.toLowerCase().trim() });
  }

  static async getById(id: string): Promise<IOrganization | null> {
    return await OrganizationModel.findById(id);
  }

  static async getBySlug(slug: string): Promise<IOrganization | null> {
    return await OrganizationModel.findOne({ slug: slug.toLowerCase() });
  }

  static async updateStatus(
    id: string,
    status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED",
  ): Promise<IOrganization | null> {
    return await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
  }

  static async updateStorageConfig(
    id: string,
    config: StorageConfig,
  ): Promise<IOrganization> {
    const isValid = await StorageService.testConnection(config);
    if (!isValid) {
      throw new Error("Failed to verify S3/R2 bucket credentials. Please check your settings.");
    }

    const org = await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: { storageConfig: config } },
      { new: true },
    );

    if (!org) {
      throw new Error("Organization not found.");
    }

    return org;
  }

  static async updateSesBackupConfig(
    id: string,
    config: {
      enabled: boolean;
      region?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      fromEmail?: string;
    },
  ): Promise<IOrganization> {
    const org = await OrganizationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          "sesBackupConfig.enabled": config.enabled,
          "sesBackupConfig.region": config.region || "us-east-1",
          "sesBackupConfig.accessKeyId": config.accessKeyId,
          "sesBackupConfig.secretAccessKey": config.secretAccessKey,
          "sesBackupConfig.fromEmail": config.fromEmail,
        },
      },
      { new: true },
    );
    if (!org) throw new Error("Organization not found.");
    return org;
  }

  static async updatePolicyConfig(
    id: string,
    config: {
      enforceTwoFactor?: boolean;
      spamThresholdScore?: number;
      rejectUnverifiableSpf?: boolean;
      rejectUnverifiableDkim?: boolean;
      maxSingleFileSizeBytes?: number;
      maxAttachmentCount?: number;
      defaultUserStorageBytes?: number;
      maxStorageBytes?: number;
    },
  ): Promise<IOrganization> {
    const update: Record<string, any> = {};
    if (config.enforceTwoFactor !== undefined) {
      update["policyConfig.enforceTwoFactor"] = config.enforceTwoFactor;
    }
    if (config.spamThresholdScore !== undefined) {
      update["policyConfig.spamThresholdScore"] = config.spamThresholdScore;
    }
    if (config.rejectUnverifiableSpf !== undefined) {
      update["policyConfig.rejectUnverifiableSpf"] = config.rejectUnverifiableSpf;
    }
    if (config.rejectUnverifiableDkim !== undefined) {
      update["policyConfig.rejectUnverifiableDkim"] = config.rejectUnverifiableDkim;
    }
    if (config.maxSingleFileSizeBytes !== undefined) {
      update["policyConfig.maxSingleFileSizeBytes"] = config.maxSingleFileSizeBytes;
    }
    if (config.maxAttachmentCount !== undefined) {
      update["policyConfig.maxAttachmentCount"] = config.maxAttachmentCount;
    }
    if (config.defaultUserStorageBytes !== undefined) {
      update["policyConfig.defaultUserStorageBytes"] = config.defaultUserStorageBytes;
    }
    if (config.maxStorageBytes !== undefined) {
      update["maxStorageBytes"] = config.maxStorageBytes;
    }

    const org = await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    if (!org) throw new Error("Organization not found.");
    return org;
  }

  static async getPolicyConfig(id: string): Promise<{
    enforceTwoFactor: boolean;
    spamThresholdScore: number;
    rejectUnverifiableSpf: boolean;
    rejectUnverifiableDkim: boolean;
    maxSingleFileSizeBytes: number;
    maxAttachmentCount: number;
    defaultUserStorageBytes: number;
    maxStorageBytes: number;
  }> {
    const org = await OrganizationModel.findById(id);
    if (!org) throw new Error("Organization not found.");
    return {
      enforceTwoFactor: org.policyConfig?.enforceTwoFactor !== false,
      spamThresholdScore: org.policyConfig?.spamThresholdScore ?? 5,
      rejectUnverifiableSpf: org.policyConfig?.rejectUnverifiableSpf === true,
      rejectUnverifiableDkim: org.policyConfig?.rejectUnverifiableDkim === true,
      maxSingleFileSizeBytes: org.policyConfig?.maxSingleFileSizeBytes ?? 26214400, // 25MB
      maxAttachmentCount: org.policyConfig?.maxAttachmentCount ?? 10,
      defaultUserStorageBytes: org.policyConfig?.defaultUserStorageBytes ?? 10737418240, // 10GB
      maxStorageBytes: org.maxStorageBytes ?? 107374182400, // 100GB
    };
  }


  static async updateBranding(
    id: string,
    branding: IOrganizationBranding,
    customWebmailDomains?: string[],
  ): Promise<IOrganization> {
    const update: Record<string, any> = {
      branding,
    };
    if (customWebmailDomains !== undefined) {
      update.customWebmailDomains = customWebmailDomains.map((d) => d.toLowerCase().trim()).filter(Boolean);
    }

    const org = await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    if (!org) throw new Error("Organization not found.");
    return org;
  }

  static async getBranding(id: string): Promise<{
    branding?: IOrganizationBranding;
    customWebmailDomains?: string[];
  }> {
    const org = await OrganizationModel.findById(id);
    if (!org) throw new Error("Organization not found.");
    return {
      branding: org.branding,
      customWebmailDomains: org.customWebmailDomains,
    };
  }

  static async resolveBrandingByHost(host: string): Promise<{
    isCustom: boolean;
    name: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    webmailHost: string;
  }> {
    const cleanHost = (host || "").toLowerCase().split(":")[0].trim();

    // Default sovereign system domains
    const defaultHosts = [
      "localhost",
      "127.0.0.1",
      "cellsweb.com",
      "webmail.cellsweb.com",
      "mail.cellsweb.com",
    ];

    if (!cleanHost || defaultHosts.includes(cleanHost)) {
      return {
        isCustom: false,
        name: "CellsInbox",
        webmailHost: cleanHost || "webmail.cellsweb.com",
      };
    }

    // 1. Direct match on customWebmailDomains
    let org = await OrganizationModel.findOne({
      customWebmailDomains: cleanHost,
      status: "ACTIVE",
    });

    // 2. Fallback: match via tenant registered domain (e.g. webmail.tenantcorp.com -> tenantcorp.com)
    if (!org) {
      const parts = cleanHost.split(".");
      if (parts.length >= 2) {
        const candidateDomain = parts.length > 2 ? parts.slice(1).join(".") : cleanHost;
        const domain = await DomainModel.findOne({
          name: candidateDomain,
          isVerified: true,
        });

        if (domain) {
          org = await OrganizationModel.findOne({
            _id: domain.organizationId,
            status: "ACTIVE",
          });
        }
      }
    }

    if (org && (org.branding?.logoUrl || org.branding?.companyName || org.branding?.primaryColor)) {
      return {
        isCustom: true,
        name: org.branding?.companyName || org.name,
        logoUrl: org.branding?.logoUrl,
        faviconUrl: org.branding?.faviconUrl,
        primaryColor: org.branding?.primaryColor,
        webmailHost: cleanHost,
      };
    }

    return {
      isCustom: false,
      name: "CellsInbox",
      webmailHost: cleanHost,
    };
  }

  static async listOrganizations(query: {
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ items: IOrganization[]; total: number }> {
    const filter: Record<string, any> = {};
    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      OrganizationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(query.skip || 0)
        .limit(query.limit || 50),
      OrganizationModel.countDocuments(filter),
    ]);

    return { items, total };
  }
}
