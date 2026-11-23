import dns from "node:dns/promises";
import nodemailer from "nodemailer";
import {
  DeliveryQueueModel,
  MessageModel,
  MessageBodyModel,
  AttachmentModel,
  DomainModel,
  OrganizationModel,
  type IDeliveryQueue,
} from "@cellsinbox/db";
import { env } from "@cellsinbox/env";
import { StorageService } from "./StorageService.js";
import { QueueService } from "./QueueService.js";

export interface DeliveryOptions {
  overrideMxHost?: string;
  overrideMxPort?: number;
  overrideTls?: boolean;
}

export interface DeliveryResult {
  queueId: string;
  success: boolean;
  messageId?: string;
  error?: string;
  usedFallback?: boolean;
  dkimSigned: boolean;
}

export class MtaService {
  /**
   * Dispatches a single outbound delivery item with 2048-bit DKIM signing
   * and automatic MX resolution (or fallback relay).
   */
  static async deliverQueueItem(
    queueId: string,
    options?: DeliveryOptions,
  ): Promise<DeliveryResult> {
    const item = await DeliveryQueueModel.findById(queueId);
    if (!item) {
      throw new Error(`Queue item ${queueId} not found`);
    }

    const message = await MessageModel.findById(item.messageId);
    const body = await MessageBodyModel.findOne({ messageId: item.messageId });
    const attachments = await AttachmentModel.find({ messageId: item.messageId });

    const senderDomain = item.sender.split("@")[1]?.toLowerCase().trim();
    const recipientDomain = item.recipient.split("@")[1]?.toLowerCase().trim();

    if (!senderDomain || !recipientDomain) {
      const errMsg = `Malformed sender or recipient email: ${item.sender} -> ${item.recipient}`;
      await QueueService.recordAttemptFailure(queueId, errMsg, 501);
      return { queueId, success: false, error: errMsg, dkimSigned: false };
    }

    // 1. Fetch domain DKIM 2048-bit RSA private key
    let dkimConfig: { domainName: string; keySelector: string; privateKey: string } | undefined = undefined;
    const domainDoc = await DomainModel.findOne({
      name: senderDomain,
      organizationId: item.organizationId,
    }).select("+dkimPrivateKey");

    if (domainDoc?.dkimPrivateKey) {
      dkimConfig = {
        domainName: senderDomain,
        keySelector: domainDoc.dkimSelector || "ci",
        privateKey: domainDoc.dkimPrivateKey,
      };
    }

    // 2. Fetch tenant attachments from BYOS S3/R2 or local fallback
    const org = await OrganizationModel.findById(item.organizationId);
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

    const resolvedAttachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    for (const att of attachments) {
      try {
        const fileBuffer = await StorageService.getRawFile(storageConfig, att.s3ObjectKey);
        resolvedAttachments.push({
          filename: att.filename,
          content: fileBuffer,
          contentType: att.contentType,
        });
      } catch (attErr: any) {
        console.warn(`[MtaService] Warning: Could not load attachment ${att.filename}:`, attErr.message);
      }
    }

    // 3. Resolve MX Target (or use override for unit/integration testing)
    let targetHost = options?.overrideMxHost;
    let targetPort = options?.overrideMxPort || 25;

    if (!targetHost) {
      try {
        const mxRecords = await dns.resolveMx(recipientDomain);
        if (!mxRecords || mxRecords.length === 0) {
          throw new Error(`No MX records found for domain '${recipientDomain}'`);
        }
        mxRecords.sort((a, b) => a.priority - b.priority);
        targetHost = mxRecords[0].exchange;
      } catch (dnsErr: any) {
        // If direct MX lookup fails, try fallback relay if configured
        if (env.SMTP_HOST && env.SMTP_HOST !== "0.0.0.0") {
          return await this.deliverViaFallback(item, message, body, resolvedAttachments, dkimConfig);
        }
        const errMsg = `DNS MX resolution failed for ${recipientDomain}: ${dnsErr.message}`;
        await QueueService.recordAttemptFailure(queueId, errMsg, 550);
        return { queueId, success: false, error: errMsg, dkimSigned: !!dkimConfig };
      }
    }

    // 4. Build SMTP Direct-to-MX Transporter with DKIM signing
    const transportOptions: any = {
      host: targetHost,
      port: targetPort,
      secure: targetPort === 465,
      name: env.MAIL_HELO_HOST || "mail.cells.local",
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false, // opportunistic TLS for Port 25
      },
    };

    if (dkimConfig) {
      transportOptions.dkim = dkimConfig;
    }

    const transporter = nodemailer.createTransport(transportOptions);

    try {
      const sendResult = await transporter.sendMail({
        from: item.sender,
        to: item.recipient,
        subject: message?.subject || "Outbound Dispatch",
        text: body?.text || "",
        html: body?.html || undefined,
        attachments: resolvedAttachments,
      });

      await QueueService.recordAttemptSuccess(queueId, {
        usedFallback: false,
        deliveryChannel: "DIRECT_PORT_25",
      });
      return {
        queueId,
        success: true,
        messageId: sendResult.messageId,
        dkimSigned: !!dkimConfig,
      };
    } catch (sendErr: any) {
      console.warn(`[MtaService] Direct Port 25 delivery to ${targetHost} failed: ${sendErr.message}`);

      // 5. If Direct MX fails and fallback SMTP or SES backup is configured, attempt fallback delivery
      if (!options?.overrideMxHost) {
        if (org?.sesBackupConfig?.enabled && org.sesBackupConfig.accessKeyId && org.sesBackupConfig.secretAccessKey) {
          console.log(`[MtaService] Attempting secondary backup delivery via Amazon SES (${org.sesBackupConfig.region})...`);
          return await this.deliverViaSesBackup(item, message, body, resolvedAttachments, org.sesBackupConfig, dkimConfig);
        } else if (env.SMTP_HOST && env.SMTP_HOST !== "0.0.0.0") {
          console.log(`[MtaService] Attempting fallback relay via ${env.SMTP_HOST}...`);
          return await this.deliverViaFallback(item, message, body, resolvedAttachments, dkimConfig);
        }
      }

      await QueueService.recordAttemptFailure(queueId, sendErr.message);
      return {
        queueId,
        success: false,
        error: sendErr.message,
        dkimSigned: !!dkimConfig,
      };
    }
  }

  /**
   * Secondary backup delivery via Amazon SES SMTP endpoint
   */
  private static async deliverViaSesBackup(
    item: IDeliveryQueue,
    message: any,
    body: any,
    attachments: any[],
    sesConfig: { region: string; accessKeyId?: string; secretAccessKey?: string; fromEmail?: string },
    dkimConfig?: any,
  ): Promise<DeliveryResult> {
    try {
      const sesHost = `email-smtp.${sesConfig.region || "us-east-1"}.amazonaws.com`;
      const sesTransporter = nodemailer.createTransport({
        host: sesHost,
        port: 587,
        secure: false,
        name: env.MAIL_HELO_HOST || "mail.cells.local",
        auth: {
          user: sesConfig.accessKeyId || "",
          pass: sesConfig.secretAccessKey || "",
        },
        tls: { rejectUnauthorized: true },
        dkim: dkimConfig,
      });

      const sendResult = await sesTransporter.sendMail({
        from: sesConfig.fromEmail || item.sender,
        to: item.recipient,
        subject: message?.subject || "Outbound Dispatch",
        text: body?.text || "",
        html: body?.html || undefined,
        attachments,
      });

      await QueueService.recordAttemptSuccess(item._id.toString(), {
        usedFallback: true,
        deliveryChannel: "AMAZON_SES_BACKUP",
      });
      return {
        queueId: item._id.toString(),
        success: true,
        messageId: sendResult.messageId,
        usedFallback: true,
        dkimSigned: !!dkimConfig,
      };
    } catch (sesErr: any) {
      const errMsg = `Secondary Amazon SES backup relay failed: ${sesErr.message}`;
      await QueueService.recordAttemptFailure(item._id.toString(), errMsg);
      return {
        queueId: item._id.toString(),
        success: false,
        error: errMsg,
        usedFallback: true,
        dkimSigned: !!dkimConfig,
      };
    }
  }

  /**
   * Fallback delivery via authenticated relay (e.g. AWS SES / SendGrid)
   */
  private static async deliverViaFallback(
    item: IDeliveryQueue,
    message: any,
    body: any,
    attachments: any[],
    dkimConfig?: any,
  ): Promise<DeliveryResult> {
    try {
      const fallbackOptions: any = {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_SECURE || false,
        name: env.MAIL_HELO_HOST || "mail.cells.local",
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        } : undefined,
      };

      if (dkimConfig) {
        fallbackOptions.dkim = dkimConfig;
      }

      const fallbackTransporter = nodemailer.createTransport(fallbackOptions);
      const sendResult = await fallbackTransporter.sendMail({
        from: env.SMTP_FROM || item.sender,
        to: item.recipient,
        subject: message?.subject || "Outbound Dispatch",
        text: body?.text || "",
        html: body?.html || undefined,
        attachments,
      });

      await QueueService.recordAttemptSuccess(item._id.toString(), {
        usedFallback: true,
        deliveryChannel: "RELAY_FALLBACK",
      });
      return {
        queueId: item._id.toString(),
        success: true,
        messageId: sendResult.messageId,
        usedFallback: true,
        dkimSigned: !!dkimConfig,
      };
    } catch (fallbackErr: any) {
      const errMsg = `Both Direct MX and Fallback Relay failed: ${fallbackErr.message}`;
      await QueueService.recordAttemptFailure(item._id.toString(), errMsg);
      return {
        queueId: item._id.toString(),
        success: false,
        error: errMsg,
        usedFallback: true,
        dkimSigned: !!dkimConfig,
      };
    }
  }

  /**
   * Processes a batch of pending queue items
   */
  static async processQueueBatch(
    batchSize: number = 10,
    options?: DeliveryOptions,
  ): Promise<DeliveryResult[]> {
    const items = await QueueService.fetchNextBatch(batchSize);
    const results: DeliveryResult[] = [];

    for (const item of items) {
      const result = await this.deliverQueueItem(item._id.toString(), options);
      results.push(result);
    }

    return results;
  }
}
