import { DeliveryQueueModel, type IDeliveryQueue } from "@cellsinbox/db";

export class QueueService {
  static async enqueueOutbound(data: {
    organizationId: string;
    messageId: string;
    sender: string;
    recipient: string;
  }): Promise<IDeliveryQueue> {
    const item = new DeliveryQueueModel({
      organizationId: data.organizationId,
      messageId: data.messageId,
      sender: data.sender,
      recipient: data.recipient,
      status: "PENDING",
      attempts: 0,
      nextAttemptAt: new Date(),
    });
    return await item.save();
  }

  static async fetchNextBatch(batchSize: number = 20): Promise<IDeliveryQueue[]> {
    const now = new Date();
    return await DeliveryQueueModel.find({
      status: { $in: ["PENDING", "FAILED"] },
      attempts: { $lt: 5 },
      nextAttemptAt: { $lte: now },
    })
      .sort({ nextAttemptAt: 1 })
      .limit(batchSize);
  }

  static async recordAttemptSuccess(
    id: string,
    metadata?: {
      usedFallback?: boolean;
      deliveryChannel?: "DIRECT_PORT_25" | "AMAZON_SES_BACKUP" | "RELAY_FALLBACK";
    },
  ): Promise<void> {
    await DeliveryQueueModel.findByIdAndUpdate(id, {
      $set: {
        status: "DELIVERED",
        usedFallback: metadata?.usedFallback ?? false,
        deliveryChannel: metadata?.deliveryChannel ?? "DIRECT_PORT_25",
      },
      $inc: { attempts: 1 },
    });
  }

  static async recordAttemptFailure(
    id: string,
    error: string,
    smtpCode?: number,
  ): Promise<void> {
    const item = await DeliveryQueueModel.findById(id);
    if (!item) return;

    item.attempts += 1;
    item.lastError = error;
    item.smtpResponseCode = smtpCode;

    if (item.attempts >= item.maxAttempts) {
      item.status = "BOUNCED";
    } else {
      item.status = "FAILED";
      // Exponential backoff: 1min, 5min, 25min, 2hr...
      const backoffMinutes = Math.pow(5, item.attempts);
      item.nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
    }

    await item.save();
  }
}
