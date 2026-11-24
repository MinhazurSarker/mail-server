import { Schema, model, type Document, Types } from "mongoose";

export interface ICredential extends Document {
  userId: Types.ObjectId;
  type: "PASSKEY" | "TOTP" | "RECOVERY_CODE" | "ARCHIVED_TOTP";
  name?: string;
  credentialId?: string;
  publicKey?: string;
  counter?: number;
  transports?: string[];
  secret?: string;
  lastUsedTimeStep?: number;
  createdAt: Date;
  lastUsedAt?: Date;
  archivedReason?: string;
  archivedAt?: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["PASSKEY", "TOTP", "RECOVERY_CODE", "ARCHIVED_TOTP"], required: true, index: true },
    name: { type: String },
    credentialId: { type: String, unique: true, sparse: true, index: true },
    publicKey: { type: String },
    counter: { type: Number, default: 0 },
    transports: [{ type: String }],
    secret: { type: String, select: false },
    lastUsedTimeStep: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    archivedReason: { type: String },
    archivedAt: { type: Date },
  },
  { timestamps: true },
);

CredentialSchema.index(
  { userId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "TOTP" }, name: "userId_1_type_1_totp_unique" },
);

export const CredentialModel = model<ICredential>("Credential", CredentialSchema);
