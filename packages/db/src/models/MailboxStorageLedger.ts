import { Schema, model, type Document, Types } from "mongoose";

export interface IMailboxStorageLedger extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  operationId: string;
  sizeBytes: number;
  operation: "INBOUND" | "OUTBOUND" | "DRAFT" | "IMPORT" | "RECONCILED";
  createdAt: Date;
  updatedAt: Date;
}

const MailboxStorageLedgerSchema = new Schema<IMailboxStorageLedger>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
    operationId: { type: String, required: true, index: true },
    sizeBytes: { type: Number, required: true, min: 0 },
    operation: {
      type: String,
      enum: ["INBOUND", "OUTBOUND", "DRAFT", "IMPORT", "RECONCILED"],
      required: true,
    },
  },
  { timestamps: true }
);

// Compound Unique Index: Ensures a mailbox can only be charged once per canonical message
MailboxStorageLedgerSchema.index({ userId: 1, messageId: 1 }, { unique: true });

// Operation idempotency index: Ensures a retry of the same operationId does not duplicate charge
MailboxStorageLedgerSchema.index({ userId: 1, operationId: 1 }, { unique: true });

export const MailboxStorageLedgerModel = model<IMailboxStorageLedger>(
  "MailboxStorageLedger",
  MailboxStorageLedgerSchema
);
