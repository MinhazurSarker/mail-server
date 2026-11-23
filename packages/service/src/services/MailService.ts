import crypto from "node:crypto";
import { simpleParser, type ParsedMail } from "mailparser";
import {
  MessageModel,
  MessageBodyModel,
  AttachmentModel,
  MailboxStateModel,
  OrganizationModel,
  UserModel,
  isValidObjectId,
  type IMessage,
} from "@cellsinbox/db";
import { StorageService } from "./StorageService.js";
import { MailEvents } from "./MailEvents.js";
import { QueueService } from "./QueueService.js";

export interface MailboxItem {
  id: string;
  messageId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  subject: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  date: Date;
  hasAttachments: boolean;
  sizeBytes: number;
  snippet: string;
  labels?: string[];
}

export interface MailboxListResult {
  items: MailboxItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface MessageDetailResult {
  id: string;
  mailboxStateId: string;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  messageId: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  cc?: Array<{ name?: string; address: string }>;
  bcc?: Array<{ name?: string; address: string }>;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  subject: string;
  date: Date;
  hasAttachments: boolean;
  sizeBytes: number;
  labels?: string[];
  body: {
    text: string;
    html: string;
    snippet: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl: string;
  }>;
}

export interface MailboxStatsResult {
  inboxUnread: number;
  inboxTotal: number;
  starred: number;
  sent: number;
  drafts: number;
  trash: number;
}

export class MailService {
  /**
   * Ingests an inbound RFC 5322 MIME stream directly from SMTP port 25
   */
  static async ingestInboundMessage(options: {
    rawMime: Buffer;
    envelopeFrom: string;
    envelopeRecipients: string[];
  }): Promise<IMessage[]> {
    const parsed: ParsedMail = await simpleParser(options.rawMime);
    const messageId = parsed.messageId || `<${crypto.randomUUID()}@cells.local>`;

    const savedMessages: IMessage[] = [];

    // Deliver to each local recipient matching our tenants
    for (const recipientAddress of options.envelopeRecipients) {
      const cleanRecipient = recipientAddress.toLowerCase().trim();
      const user = await UserModel.findOne({ email: cleanRecipient });
      if (!user) continue;

      const org = await OrganizationModel.findById(user.organizationId);
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

      // 1. Offload raw MIME to Tenant S3/R2 (or local fallback)
      const datePrefix = new Date().toISOString().slice(0, 10);
      const mimeKey = `messages/${user.organizationId}/${datePrefix}/${crypto.randomUUID()}.eml`;
      await StorageService.uploadRawMime(storageConfig, mimeKey, options.rawMime);

      // 2. Offload Attachments to Tenant S3/R2 (or local fallback)
      const createdAttachments: Array<{
        filename: string;
        contentType: string;
        sizeBytes: number;
        contentId?: string;
        s3ObjectKey: string;
      }> = [];

      for (const att of parsed.attachments || []) {
        const attKey = `attachments/${user.organizationId}/${datePrefix}/${crypto.randomUUID()}-${att.filename || "attachment"}`;
        await StorageService.uploadAttachment(storageConfig, attKey, att.content, att.contentType);
        createdAttachments.push({
          filename: att.filename || "untitled",
          contentType: att.contentType,
          sizeBytes: att.size,
          contentId: att.contentId,
          s3ObjectKey: attKey,
        });
      }

      // 3. Save Normalized Message
      const toAddresses = (parsed.to ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]) : []).flatMap((t) =>
        t.value.map((v) => ({ name: v.name, address: v.address || "" })),
      );

      const message = new MessageModel({
        organizationId: user.organizationId,
        messageId,
        inReplyTo: parsed.inReplyTo,
        references: Array.isArray(parsed.references) ? parsed.references : parsed.references ? [parsed.references] : [],
        from: {
          name: parsed.from?.value[0]?.name,
          address: parsed.from?.value[0]?.address || options.envelopeFrom,
        },
        to: toAddresses.length > 0 ? toAddresses : [{ address: cleanRecipient }],
        subject: parsed.subject || "(No Subject)",
        date: parsed.date || new Date(),
        s3RawKey: mimeKey,
        sizeBytes: options.rawMime.length,
        hasAttachments: createdAttachments.length > 0,
      });
      await message.save();

      // 4. Save Message Body
      const snippet = (parsed.text || "").slice(0, 200).replace(/\s+/g, " ").trim();
      await MessageBodyModel.create({
        messageId: message._id,
        text: parsed.text,
        html: parsed.html || parsed.textAsHtml,
        snippet,
      });

      // 5. Save Attachment records
      for (const attData of createdAttachments) {
        await AttachmentModel.create({
          messageId: message._id,
          ...attData,
        });
      }

      // 6. Create MailboxState (INBOX) for the recipient
      await MailboxStateModel.create({
        userId: user._id,
        messageId: message._id,
        folder: "INBOX",
        isRead: false,
        isStarred: false,
      });

      // 7. Emit Real-Time Mail Event
      MailEvents.emitMailReceived({
        userId: user._id.toString(),
        organizationId: user.organizationId.toString(),
        messageId: message._id.toString(),
        folder: "INBOX",
        subject: message.subject,
        from: message.from,
        to: message.to,
        date: message.date,
        snippet,
        hasAttachments: createdAttachments.length > 0,
      });

      savedMessages.push(message);
    }

    return savedMessages;
  }

  /**
   * Lists emails for a user's webmail folder with pagination, search, and unread counts
   */
  static async listUserMailbox(params: {
    userId: string;
    folder?: string;
    page?: number;
    limit?: number;
    isStarred?: boolean;
    isRead?: boolean;
    search?: string;
  }): Promise<MailboxListResult> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 30));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { userId: params.userId };

    if (params.folder) {
      query.folder = params.folder.toUpperCase();
    }
    if (typeof params.isStarred === "boolean") {
      query.isStarred = params.isStarred;
    }
    if (typeof params.isRead === "boolean") {
      query.isRead = params.isRead;
    }

    // Filter by search string across subject and sender if provided
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      const matchingMessages = await MessageModel.find({
        $or: [
          { subject: { $regex: term, $options: "i" } },
          { "from.address": { $regex: term, $options: "i" } },
          { "from.name": { $regex: term, $options: "i" } },
        ],
      }).select("_id");
      const ids = matchingMessages.map((m) => m._id);
      query.messageId = { $in: ids };
    }

    const states = await MailboxStateModel.find(query)
      .populate("messageId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MailboxStateModel.countDocuments(query);
    const unreadCount = await MailboxStateModel.countDocuments({
      userId: params.userId,
      folder: params.folder ? params.folder.toUpperCase() : "INBOX",
      isRead: false,
    });

    // Populate snippets from MessageBodyModel
    const messageIds = states
      .map((s) => (s.messageId as any)?._id || s.messageId)
      .filter(Boolean);

    const bodies = await MessageBodyModel.find(
      { messageId: { $in: messageIds } },
      { messageId: 1, snippet: 1 },
    );

    const snippetMap = new Map<string, string>();
    for (const b of bodies) {
      snippetMap.set(b.messageId.toString(), b.snippet || "");
    }

    const items: MailboxItem[] = states.map((s) => {
      const msg = s.messageId as any;
      const msgIdStr = msg?._id?.toString() || s.messageId.toString();
      return {
        id: s._id.toString(),
        messageId: msgIdStr,
        folder: s.folder,
        isRead: s.isRead,
        isStarred: s.isStarred,
        subject: msg?.subject || "(No Subject)",
        from: msg?.from || { address: "unknown" },
        to: msg?.to || [],
        date: msg?.date || s.createdAt,
        hasAttachments: msg?.hasAttachments || false,
        sizeBytes: msg?.sizeBytes || 0,
        snippet: snippetMap.get(msgIdStr) || "",
        labels: s.labels || [],
      };
    });

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  /**
   * Retrieves full email details, body, attachments, and marks as read
   */
  static async getMessageDetails(params: {
    userId: string;
    messageId: string;
    markAsRead?: boolean;
  }): Promise<MessageDetailResult> {
    let targetMessageId = params.messageId;
    let message = null;

    if (isValidObjectId(params.messageId)) {
      message = await MessageModel.findById(params.messageId);
    }
    if (!message) {
      message = await MessageModel.findOne({ messageId: params.messageId });
      if (message) {
        targetMessageId = message._id.toString();
      }
    }

    if (!message) {
      throw new Error("Underlying message entity not found");
    }

    const state = await MailboxStateModel.findOne({
      userId: params.userId,
      messageId: targetMessageId,
    });

    if (!state) {
      throw new Error("Message not found in user mailbox");
    }

    // Auto mark as read unless explicitly disabled
    if (params.markAsRead !== false && !state.isRead) {
      state.isRead = true;
      await state.save();
      MailEvents.emitStateChanged({
        userId: params.userId,
        messageId: targetMessageId,
        isRead: true,
      });
    }

    const body = await MessageBodyModel.findOne({ messageId: targetMessageId });
    const attachments = await AttachmentModel.find({ messageId: targetMessageId });

    // Resolve tenant storage config for pre-signed URLs
    const user = await UserModel.findById(params.userId);
    const org = user ? await OrganizationModel.findById(user.organizationId) : null;
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

    const attachmentList = await Promise.all(
      attachments.map(async (att) => {
        let downloadUrl = "";
        try {
          downloadUrl = await StorageService.getAttachmentSignedUrl(storageConfig, att.s3ObjectKey);
        } catch {
          downloadUrl = `/api/attachment/${att._id}`;
        }

        return {
          id: att._id.toString(),
          filename: att.filename,
          contentType: att.contentType,
          sizeBytes: att.sizeBytes,
          downloadUrl,
        };
      }),
    );

    return {
      id: message._id.toString(),
      mailboxStateId: state._id.toString(),
      folder: state.folder,
      isRead: state.isRead,
      isStarred: state.isStarred,
      messageId: message.messageId,
      from: message.from,
      to: message.to,
      cc: message.cc || [],
      bcc: message.bcc || [],
      spfResult: message.spfResult || "pass",
      dkimResult: message.dkimResult || "pass",
      dmarcResult: message.dmarcResult || "pass",
      subject: message.subject,
      date: message.date,
      hasAttachments: message.hasAttachments,
      sizeBytes: message.sizeBytes,
      body: {
        text: body?.text || "",
        html: body?.html || "",
        snippet: body?.snippet || "",
      },
      attachments: attachmentList,
      labels: state.labels || [],
    };
  }

  /**
   * Updates state flags (read, starred, folder)
   */
  static async updateMailboxState(params: {
    userId: string;
    messageId: string;
    folder?: string;
    isRead?: boolean;
    isStarred?: boolean;
    labels?: string[];
  }): Promise<boolean> {
    const update: Record<string, any> = {};
    if (params.folder) update.folder = params.folder.toUpperCase();
    if (typeof params.isRead === "boolean") update.isRead = params.isRead;
    if (typeof params.isStarred === "boolean") update.isStarred = params.isStarred;
    if (params.labels !== undefined) update.labels = params.labels;

    let targetMessageId = params.messageId;
    if (!isValidObjectId(params.messageId)) {
      const msg = await MessageModel.findOne({ messageId: params.messageId });
      if (msg) targetMessageId = msg._id.toString();
    }

    const updated = await MailboxStateModel.findOneAndUpdate(
      { userId: params.userId, messageId: targetMessageId },
      { $set: update },
      { new: true },
    );

    if (updated) {
      MailEvents.emitStateChanged({
        userId: params.userId,
        messageId: params.messageId,
        folder: updated.folder,
        isRead: updated.isRead,
        isStarred: updated.isStarred,
      });
      return true;
    }
    return false;
  }

  /**
   * Deletes message (moves to TRASH or permanently deletes)
   */
  static async deleteMessage(params: {
    userId: string;
    messageId: string;
    permanent?: boolean;
  }): Promise<boolean> {
    if (params.permanent) {
      await MailboxStateModel.findOneAndDelete({
        userId: params.userId,
        messageId: params.messageId,
      });
      return true;
    }

    return await this.updateMailboxState({
      userId: params.userId,
      messageId: params.messageId,
      folder: "TRASH",
    });
  }

  /**
   * Aggregates mailbox statistics across folders
   */
  static async getMailboxStats(userId: string): Promise<MailboxStatsResult> {
    const [inboxUnread, inboxTotal, starred, sent, drafts, trash] = await Promise.all([
      MailboxStateModel.countDocuments({ userId, folder: "INBOX", isRead: false }),
      MailboxStateModel.countDocuments({ userId, folder: "INBOX" }),
      MailboxStateModel.countDocuments({ userId, isStarred: true }),
      MailboxStateModel.countDocuments({ userId, folder: "SENT" }),
      MailboxStateModel.countDocuments({ userId, folder: "DRAFTS" }),
      MailboxStateModel.countDocuments({ userId, folder: "TRASH" }),
    ]);

    return {
      inboxUnread,
      inboxTotal,
      starred,
      sent,
      drafts,
      trash,
    };
  }

  /**
   * Fetches attachment content in base64
   */
  static async getAttachmentContent(params: {
    userId: string;
    messageId: string;
    attachmentId: string;
  }): Promise<{ filename: string; contentType: string; data: string }> {
    const state = await MailboxStateModel.findOne({
      userId: params.userId,
      messageId: params.messageId,
    });
    if (!state) {
      throw new Error("Unauthorized: Message not in user mailbox");
    }

    const attachment = await AttachmentModel.findById(params.attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    const user = await UserModel.findById(params.userId);
    const org = user ? await OrganizationModel.findById(user.organizationId) : null;
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

    const buffer = await StorageService.getRawFile(storageConfig, attachment.s3ObjectKey);
    return {
      filename: attachment.filename,
      contentType: attachment.contentType,
      data: buffer.toString("base64"),
    };
  }

  /**
   * Sends an email from webmail or API:
   * Handles local delivery directly if recipient is on our server,
   * otherwise enqueues for outbound MTA delivery.
   */
  static async sendMail(params: {
    userId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<{ messageId: string; deliveredInternally: number; queuedOutbound: number }> {
    const user = await UserModel.findById(params.userId);
    if (!user) throw new Error("Sender user not found");

    const messageId = `<${crypto.randomUUID()}@cells.local>`;
    const toRecipients = params.to.map((addr) => ({ address: addr.trim().toLowerCase() }));
    const ccRecipients = (params.cc || []).map((addr) => ({ address: addr.trim().toLowerCase() }));
    const bccRecipients = (params.bcc || []).map((addr) => ({ address: addr.trim().toLowerCase() }));

    // 1. Create normalized message record
    const message = new MessageModel({
      organizationId: user.organizationId,
      messageId,
      from: { name: user.displayName || user.email, address: user.email },
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: params.subject || "(No Subject)",
      date: new Date(),
      s3RawKey: `sent/${user.organizationId}/${crypto.randomUUID()}.eml`,
      sizeBytes: (params.text || "").length + (params.html || "").length,
      hasAttachments: false,
    });
    await message.save();

    // 2. Create message body
    const snippet = (params.text || params.html || "").slice(0, 200).replace(/\s+/g, " ").trim();
    await MessageBodyModel.create({
      messageId: message._id,
      text: params.text || "",
      html: params.html || "",
      snippet,
    });

    // 3. Put into sender's SENT folder
    await MailboxStateModel.create({
      userId: user._id,
      messageId: message._id,
      folder: "SENT",
      isRead: true,
      isStarred: false,
    });

    let deliveredInternally = 0;
    let queuedOutbound = 0;

    // 4. Distribute to all recipients (to, cc, bcc)
    const allRecipients = [...toRecipients, ...ccRecipients, ...bccRecipients];
    const uniqueRecipients = Array.from(new Set(allRecipients.map((r) => r.address))).map((addr) => ({
      address: addr,
    }));

    for (const recipient of uniqueRecipients) {
      const localUser = await UserModel.findOne({ email: recipient.address });
      if (localUser) {
        // Internal recipient delivery
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
          hasAttachments: false,
        });
        deliveredInternally++;
      } else {
        // External recipient outbound delivery queue
        await QueueService.enqueueOutbound({
          organizationId: user.organizationId.toString(),
          messageId: message._id.toString(),
          sender: user.email,
          recipient: recipient.address,
        });
        queuedOutbound++;
      }
    }

    return {
      messageId: message._id.toString(),
      deliveredInternally,
      queuedOutbound,
    };
  }
}
