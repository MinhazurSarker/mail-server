import { Schema, model, type Document, Types } from "mongoose";

export interface IStorageLocation {
  provider: "local_fallback" | "s3_r2" | "aws_s3";
  bucket: string;
  endpoint?: string;
  key: string;
  versionId?: string;
}

export interface IStoragePurgeQueue extends Document {
  organizationId: Types.ObjectId;
  locations: IStorageLocation[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  attempts: number;
  lastError?: string;
  nextRetryAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StoragePurgeQueueSchema = new Schema<IStoragePurgeQueue>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    locations: [
      {
        provider: { type: String, required: true },
        bucket: { type: String, required: true },
        endpoint: { type: String },
        key: { type: String, required: true },
        versionId: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    nextRetryAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

StoragePurgeQueueSchema.index({ status: 1, nextRetryAt: 1 });

export const StoragePurgeQueueModel = model<IStoragePurgeQueue>(
  "StoragePurgeQueue",
  StoragePurgeQueueSchema
);
