import crypto from "node:crypto";
import argon2 from "argon2";
import {
  ApiKeyModel,
  MessageModel,
  MessageBodyModel,
  AttachmentModel,
  UserModel,
  OrganizationModel,
  type IApiKey,
} from "@cellsinbox/db";
import { StorageService } from "./StorageService.js";
import { QueueService } from "./QueueService.js";
import { MailEvents } from "./MailEvents.js";

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ProgrammaticSendParams {
  apiKey: IApiKey;
  from: string;
  fromName?: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 or utf8
    contentType: string;
  }>;
}

export interface ProgrammaticSendResult {
  messageId: string;
  status: "queued" | "delivered";
  to: string[];
  deliveredInternally: number;
  queuedOutbound: number;
}

export class ApiKeyService {
  // In-memory sliding rate limiter: keyId -> { count, windowStart }
  private static rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  /**
   * Generates a new cryptographically secure API key (ci_live_...)
   */
  static async createApiKey(data: {
    organizationId: string;
    userId: string;
    name: string;
    allowedDomains: string[];
    rateLimitPerMinute?: number;
    expiresAt?: Date;
  }): Promise<{ apiKey: IApiKey; rawSecretKey: string }> {
    const randomHex = crypto.randomBytes(24).toString("hex");
    const rawSecretKey = `ci_live_${randomHex}`;
    const keyPrefix = rawSecretKey.substring(0, 16);
    const keyHash = await argon2.hash(rawSecretKey);

    const apiKey = new ApiKeyModel({
      organizationId: data.organizationId,
      userId: data.userId,
      name: data.name,
      keyPrefix,
      keyHash,
      allowedDomains: data.allowedDomains.map((d) => d.toLowerCase().trim()),
      rateLimitPerMinute: data.rateLimitPerMinute || 60,
      expiresAt: data.expiresAt,
    });

    const savedKey = await apiKey.save();
    return { apiKey: savedKey, rawSecretKey };
  }

  /**
   * Lists all API keys for an organization or user (excluding sensitive hashes)
   */
  static async listApiKeys(params: {
    organizationId: string;
    userId?: string;
  }): Promise<ApiKeyItem[]> {
    const query: Record<string, any> = { organizationId: params.organizationId };
    if (params.userId) {
      query.userId = params.userId;
    }

    const keys = await ApiKeyModel.find(query).sort({ createdAt: -1 });

    return keys.map((k) => ({
      id: k._id.toString(),
      name: k.name,
      keyPrefix: `${k.keyPrefix}...`,
      allowedDomains: k.allowedDomains,
      rateLimitPerMinute: k.rateLimitPerMinute,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));
  }

  /**
   * Revokes (deletes) an API key
   */
  static async revokeApiKey(params: {
    apiKeyId: string;
    organizationId: string;
    userId?: string;
  }): Promise<boolean> {
    const query: Record<string, any> = {
      _id: params.apiKeyId,
      organizationId: params.organizationId,
    };
    if (params.userId) {
      query.userId = params.userId;
    }

    const deleted = await ApiKeyModel.findOneAndDelete(query);
    if (deleted) {
      this.rateLimitMap.delete(deleted._id.toString());
      return true;
    }
    return false;
  }

  /**
   * Enforces in-memory sliding rate limiting
   */
  static checkRateLimit(keyId: string, limitPerMinute: number): void {
    const now = Date.now();
    let tracker = this.rateLimitMap.get(keyId);

    if (!tracker || now - tracker.windowStart >= 60000) {
      tracker = { count: 1, windowStart: now };
      this.rateLimitMap.set(keyId, tracker);
    } else {
      if (tracker.count >= limitPerMinute) {
        throw new Error(
          `Rate limit exceeded: maximum ${limitPerMinute} requests per minute reached for this API key.`,
        );
      }
      tracker.count++;
    }
  }

  /**
   * Validates a raw API key (ci_live_...) and checks expiry & rate limits
   */
  static async validateApiKey(rawKey: string): Promise<IApiKey> {
    if (!rawKey.startsWith("ci_live_")) {
      throw new Error("Invalid API key format. Expected 'ci_live_...' key.");
    }

    const keyPrefix = rawKey.substring(0, 16);
    const candidateKeys = await ApiKeyModel.find({ keyPrefix });

    for (const candidate of candidateKeys) {
      const match = await argon2.verify(candidate.keyHash, rawKey);
      if (match) {
        // Check expiration
        if (candidate.expiresAt && candidate.expiresAt.getTime() < Date.now()) {
          throw new Error("API key has expired.");
        }

        // Check Rate Limit
        this.checkRateLimit(candidate._id.toString(), candidate.rateLimitPerMinute);

        candidate.lastUsedAt = new Date();
        await candidate.save();
        return candidate;
      }
    }

    throw new Error("Invalid or revoked API key.");
  }

  /**
   * SendGrid-compatible programmatic mail sender:
   * Validates sender domain authorization, offloads attachments to S3/R2,
   * creates normalized records, delivers internal emails directly, and queues external emails for outbound MTA.
   */
  static async sendProgrammaticEmail(
    params: ProgrammaticSendParams,
  ): Promise<ProgrammaticSendResult> {
    const { apiKey, from, fromName, to, subject, text, html, attachments } = params;

    const senderEmail = from.toLowerCase().trim();
    const senderDomain = senderEmail.split("@")[1];

    if (!senderDomain) {
      throw new Error(`Invalid 'from' email address: ${from}`);
    }

    // 0. Enforce Rate Limit
    this.checkRateLimit(apiKey._id.toString(), apiKey.rateLimitPerMinute);

    // 1. Enforce Domain Authorization
    const isDomainAllowed =
      apiKey.allowedDomains.includes("*") ||
      apiKey.allowedDomains.includes(senderDomain);

    if (!isDomainAllowed) {
      throw new Error(
        `Unauthorized sender domain '${senderDomain}'. This API key is restricted to: [${apiKey.allowedDomains.join(", ")}]`,
      );
    }

    if (!to || to.length === 0) {
      throw new Error("At least one recipient ('to') email address is required.");
    }

    const toRecipients = to.map((addr) => ({ address: addr.trim().toLowerCase() }));

    // 2. Fetch tenant organization storage config
    const org = await OrganizationModel.findById(apiKey.organizationId);
    const storageConfig = (org?.storageConfig && org.storageConfig.provider)
      ? (org.storageConfig as any)
      : {
          provider: "local_fallback",
          bucket: "default",
          endpoint: "./storage/blobs",
          region: "auto",
          accessKeyId: "local",
          secretAccessKey: "local",
        };

    // 3. Process and offload attachments to S3/R2 (or local fallback)
    const datePrefix = new Date().toISOString().slice(0, 10);
    const createdAttachments: Array<{
      filename: string;
      contentType: string;
      sizeBytes: number;
      s3ObjectKey: string;
    }> = [];

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attBuffer = Buffer.from(att.content, att.content.includes(";") ? "utf-8" : "base64");
        const attKey = `attachments/${apiKey.organizationId}/${datePrefix}/${crypto.randomUUID()}-${att.filename}`;
        await StorageService.uploadAttachment(storageConfig, attKey, attBuffer, att.contentType);

        createdAttachments.push({
          filename: att.filename,
          contentType: att.contentType,
          sizeBytes: attBuffer.length,
          s3ObjectKey: attKey,
        });
      }
    }

    // 4. Create normalized Message record
    const messageId = `<${crypto.randomUUID()}@cells.local>`;
    const message = new MessageModel({
      organizationId: apiKey.organizationId,
      messageId,
      from: {
        name: fromName,
        address: senderEmail,
      },
      to: toRecipients,
      subject: subject || "(No Subject)",
      date: new Date(),
      s3RawKey: `api-sent/${apiKey.organizationId}/${crypto.randomUUID()}.eml`,
      sizeBytes: (text || "").length + (html || "").length,
      hasAttachments: createdAttachments.length > 0,
    });
    await message.save();

    // 5. Create MessageBody record
    const snippet = (text || html || "").slice(0, 200).replace(/\s+/g, " ").trim();
    await MessageBodyModel.create({
      messageId: message._id,
      text: text || "",
      html: html || "",
      snippet,
    });

    // 6. Save Attachment documents
    for (const attData of createdAttachments) {
      await AttachmentModel.create({
        messageId: message._id,
        ...attData,
      });
    }

    let deliveredInternally = 0;
    let queuedOutbound = 0;

    // 7. Route to recipients
    for (const recipient of toRecipients) {
      const localUser = await UserModel.findOne({ email: recipient.address });
      if (localUser) {
        // Direct internal mailbox delivery
        const { MailboxStateModel } = await import("@cellsinbox/db");
        await MailboxStateModel.create({
          userId: localUser._id,
          messageId: message._id,
          folder: "INBOX",
          isRead: false,
          isStarred: false,
        });

        MailEvents.emitMailReceived({
          userId: localUser._id.toString(),
          organizationId: localUser.organizationId.toString(),
          messageId: message._id.toString(),
          folder: "INBOX",
          subject: message.subject,
          from: message.from,
          to: message.to,
          date: message.date,
          snippet,
          hasAttachments: createdAttachments.length > 0,
        });
        deliveredInternally++;
      } else {
        // External outbound delivery queue
        await QueueService.enqueueOutbound({
          organizationId: apiKey.organizationId.toString(),
          messageId: message._id.toString(),
          sender: senderEmail,
          recipient: recipient.address,
        });
        queuedOutbound++;
      }
    }

    return {
      messageId: message._id.toString(),
      status: "queued",
      to: toRecipients.map((r) => r.address),
      deliveredInternally,
      queuedOutbound,
    };
  }
}
