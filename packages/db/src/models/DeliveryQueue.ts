import { Schema, model, type Document, Types } from "mongoose";

export interface IDeliveryQueue extends Document {
  organizationId: Types.ObjectId;
  messageId: Types.ObjectId;
  sender: string;
  recipient: string;
  status: "PENDING" | "IN_PROGRESS" | "FAILED" | "DELIVERED" | "BOUNCED";
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  usedFallback?: boolean;
  deliveryChannel?: "DIRECT_PORT_25" | "AMAZON_SES_BACKUP" | "RELAY_FALLBACK";
  lastError?: string;
  smtpResponseCode?: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryQueueSchema = new Schema<IDeliveryQueue>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
    sender: { type: String, required: true, lowercase: true, trim: true },
    recipient: { type: String, required: true, lowercase: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "FAILED", "DELIVERED", "BOUNCED"],
      default: "PENDING",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    usedFallback: { type: Boolean, default: false },
    deliveryChannel: {
      type: String,
      enum: ["DIRECT_PORT_25", "AMAZON_SES_BACKUP", "RELAY_FALLBACK"],
      default: "DIRECT_PORT_25",
    },
    lastError: { type: String },
    smtpResponseCode: { type: Number },
  },
  { timestamps: true },
);

DeliveryQueueSchema.index({ status: 1, nextAttemptAt: 1 });

export const DeliveryQueueModel = model<IDeliveryQueue>("DeliveryQueue", DeliveryQueueSchema);
