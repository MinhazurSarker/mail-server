import {
  UserModel,
  MailboxStorageLedgerModel,
  StoragePurgeQueueModel,
  type IStorageLocation,
  Types,
  type mongoose,
} from "@cellsinbox/db";

export class MailboxOverQuotaError extends Error {
  public readonly smtpCode: number;
  public readonly enhancedCode: string;

  constructor(message: string, smtpCode: number = 452, enhancedCode: string = "4.2.2") {
    super(message);
    this.name = "MailboxOverQuotaError";
    this.smtpCode = smtpCode;
    this.enhancedCode = enhancedCode;
  }
}

export interface ReserveAndChargeOptions {
  userId: string | Types.ObjectId;
  organizationId: string | Types.ObjectId;
  messageId: string | Types.ObjectId;
  operationId: string;
  sizeBytes: number;
  operation: "INBOUND" | "OUTBOUND" | "DRAFT" | "IMPORT" | "RECONCILED";
  session?: mongoose.ClientSession;
}

export interface ReserveAndChargeResult {
  charged: boolean;
  reason?: "ALREADY_CHARGED" | "OPERATION_ALREADY_COMMITTED";
  currentUsage: number;
}

export interface ReleaseChargeResult {
  released: boolean;
  releasedBytes: number;
}

export class StorageAccountingService {
  /**
   * Preliminary non-blocking quota check (e.g. for SMTP RCPT TO phase)
   */
  static async checkQuotaEligibility(
    userId: string | Types.ObjectId,
    estimatedSizeBytes: number = 0
  ): Promise<{ eligible: boolean; currentUsage: number; quota: number; remaining: number }> {
    const user = await UserModel.findById(userId).select("storageQuotaBytes storageUsedBytes");
    if (!user) {
      return { eligible: false, currentUsage: 0, quota: 0, remaining: 0 };
    }

    const quota = user.storageQuotaBytes !== undefined ? user.storageQuotaBytes : 10737418240;
    const currentUsage = user.storageUsedBytes || 0;
    const isUnlimited = quota === -1;
    const remaining = isUnlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, quota - currentUsage);
    const eligible = isUnlimited || currentUsage + estimatedSizeBytes <= quota;
    return {
      eligible,
      currentUsage,
      quota,
      remaining,
    };
  }

  /**
   * Atomically reserves quota and writes an immutable ledger charge with unique deduplication.
   */
  static async reserveAndChargeMailbox(
    options: ReserveAndChargeOptions
  ): Promise<ReserveAndChargeResult> {
    const userObjId = new Types.ObjectId(options.userId.toString());
    const orgObjId = new Types.ObjectId(options.organizationId.toString());
    const messageObjId = new Types.ObjectId(options.messageId.toString());

    // 1. Check idempotency: Has this message already been charged to this mailbox?
    const existingMsgLedger = await MailboxStorageLedgerModel.findOne({
      userId: userObjId,
      messageId: messageObjId,
    }).session(options.session || null);

    if (existingMsgLedger) {
      const user = await UserModel.findById(userObjId).select("storageUsedBytes");
      return {
        charged: false,
        reason: "ALREADY_CHARGED",
        currentUsage: user?.storageUsedBytes || 0,
      };
    }

    // 2. Check operation idempotency: Has this operation already completed for this user?
    const existingOpLedger = await MailboxStorageLedgerModel.findOne({
      userId: userObjId,
      operationId: options.operationId,
    }).session(options.session || null);

    if (existingOpLedger) {
      const user = await UserModel.findById(userObjId).select("storageUsedBytes");
      return {
        charged: false,
        reason: "OPERATION_ALREADY_COMMITTED",
        currentUsage: user?.storageUsedBytes || 0,
      };
    }

    // 3. Condition-bounded atomic reservation
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userObjId,
        $expr: {
          $or: [
            { $eq: ["$storageQuotaBytes", -1] },
            {
              $lte: [
                { $add: ["$storageUsedBytes", options.sizeBytes] },
                "$storageQuotaBytes",
              ],
            },
          ],
        },
      },
      {
        $inc: { storageUsedBytes: options.sizeBytes, storageAccountingVersion: 1 },
      },
      { new: true, session: options.session }
    );

    if (!updatedUser) {
      const currentUser = await UserModel.findById(userObjId).select("storageQuotaBytes storageUsedBytes");
      const quota = currentUser?.storageQuotaBytes || 10737418240;
      const current = currentUser?.storageUsedBytes || 0;
      throw new MailboxOverQuotaError(
        `Mailbox quota exceeded: Cannot reserve ${options.sizeBytes} bytes. Current usage: ${current}/${quota} bytes.`,
        452,
        "4.2.2"
      );
    }

    // 4. Create immutable unique ledger record
    try {
      await MailboxStorageLedgerModel.create(
        [
          {
            organizationId: orgObjId,
            userId: userObjId,
            messageId: messageObjId,
            operationId: options.operationId,
            sizeBytes: options.sizeBytes,
            operation: options.operation,
          },
        ],
        { session: options.session }
      );
    } catch (err: any) {
      // If unique constraint violated concurrently (E11000)
      if (err.code === 11000) {
        // Rollback atomic increment if outside a multi-doc transaction
        if (!options.session) {
          await UserModel.updateOne(
            { _id: userObjId },
            { $inc: { storageUsedBytes: -options.sizeBytes, storageAccountingVersion: 1 } }
          );
        }
        return {
          charged: false,
          reason: "ALREADY_CHARGED",
          currentUsage: updatedUser.storageUsedBytes - options.sizeBytes,
        };
      }
      throw err;
    }

    return {
      charged: true,
      currentUsage: updatedUser.storageUsedBytes,
    };
  }

  /**
   * Releases quota when a mailbox permanently purges its last reference to a message.
   */
  static async releaseMailboxCharge(params: {
    userId: string | Types.ObjectId;
    messageId: string | Types.ObjectId;
    session?: mongoose.ClientSession;
  }): Promise<ReleaseChargeResult> {
    const userObjId = new Types.ObjectId(params.userId.toString());
    const messageObjId = new Types.ObjectId(params.messageId.toString());

    const ledger = await MailboxStorageLedgerModel.findOneAndDelete(
      {
        userId: userObjId,
        messageId: messageObjId,
      },
      { session: params.session }
    );

    if (!ledger) {
      return { released: false, releasedBytes: 0 };
    }

    await UserModel.updateOne(
      { _id: userObjId },
      {
        $inc: { storageUsedBytes: -ledger.sizeBytes, storageAccountingVersion: 1 },
      },
      { session: params.session }
    );

    return {
      released: true,
      releasedBytes: ledger.sizeBytes,
    };
  }

  /**
   * Enqueues unreferenced physical blobs for durable garbage collection.
   */
  static async enqueueStoragePurge(params: {
    organizationId: string | Types.ObjectId;
    locations: IStorageLocation[];
    session?: mongoose.ClientSession;
  }): Promise<void> {
    if (!params.locations || params.locations.length === 0) return;

    await StoragePurgeQueueModel.create(
      [
        {
          organizationId: new Types.ObjectId(params.organizationId.toString()),
          locations: params.locations,
          status: "PENDING",
          attempts: 0,
          nextRetryAt: new Date(),
        },
      ],
      { session: params.session }
    );
  }
}
