import crypto from "node:crypto";
import dns from "node:dns/promises";
import { DomainModel, type IDomain } from "@cellsinbox/db";

export class DomainService {
  static async addDomain(organizationId: string, domainName: string): Promise<IDomain> {
    const cleanDomain = domainName.toLowerCase().trim();
    const existing = await DomainModel.findOne({ name: cleanDomain });
    if (existing) {
      throw new Error(`Domain '${cleanDomain}' is already registered.`);
    }

    // Generate DKIM 2048-bit RSA keypair
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    // Format public key for DNS TXT record (strip headers and newlines)
    const dkimDnsValue = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/[\r\n]/g, "")
      .trim();

    const verificationToken = `ci-verify=${crypto.randomBytes(16).toString("hex")}`;

    const domain = new DomainModel({
      organizationId,
      name: cleanDomain,
      verificationToken,
      dkimSelector: "ci",
      dkimPrivateKey: privateKey,
      dkimPublicKey: dkimDnsValue,
      spfStatus: "PENDING",
      dkimStatus: "PENDING",
      dmarcStatus: "PENDING",
      mxStatus: "PENDING",
    });

    return await domain.save();
  }

  static async verifyDomain(domainId: string): Promise<IDomain> {
    const domain = await DomainModel.findById(domainId).select("+dkimPrivateKey");
    if (!domain) {
      throw new Error("Domain not found.");
    }

    // Check TXT records for verification token
    try {
      const txtRecords = await dns.resolveTxt(domain.name);
      const allTxt = txtRecords.flat().join(" ");
      if (allTxt.includes(domain.verificationToken)) {
        domain.isVerified = true;
      }
    } catch (e) {
      // DNS error or no TXT
    }

    // Check MX records
    try {
      const mxRecords = await dns.resolveMx(domain.name);
      domain.mxStatus = mxRecords && mxRecords.length > 0 ? "VERIFIED" : "FAILED";
    } catch {
      domain.mxStatus = "FAILED";
    }

    // Check DKIM DNS record: ci._domainkey.<domain>
    try {
      const dkimRecords = await dns.resolveTxt(`${domain.dkimSelector}._domainkey.${domain.name}`);
      const dkimTxt = dkimRecords.flat().join("");
      domain.dkimStatus = dkimTxt.includes("v=DKIM1") ? "VERIFIED" : "FAILED";
    } catch {
      domain.dkimStatus = "FAILED";
    }

    return await domain.save();
  }

  static async getByDomainName(name: string): Promise<IDomain | null> {
    return await DomainModel.findOne({ name: name.toLowerCase().trim() });
  }

  static async listByOrganization(organizationId: string): Promise<IDomain[]> {
    return await DomainModel.find({ organizationId }).sort({ createdAt: -1 });
  }
}
