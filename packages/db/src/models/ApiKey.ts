import { Schema, model, type Document, Types } from "mongoose";

export interface IApiKey extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  keyPrefix: string;
  keyHash: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    keyPrefix: { type: String, required: true, index: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    allowedDomains: [{ type: String, lowercase: true, trim: true }],
    rateLimitPerMinute: { type: Number, default: 60 },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

export const ApiKeyModel = model<IApiKey>("ApiKey", ApiKeySchema);
