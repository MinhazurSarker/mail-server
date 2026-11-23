import { Schema, model, type Document, Types } from "mongoose";

export interface ICredential extends Document {
  userId: Types.ObjectId;
  type: "PASSKEY" | "TOTP" | "RECOVERY_CODE";
  name?: string;
  credentialId?: string;
  publicKey?: string;
  counter?: number;
  transports?: string[];
  secret?: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["PASSKEY", "TOTP", "RECOVERY_CODE"], required: true, index: true },
    name: { type: String },
    credentialId: { type: String, unique: true, sparse: true, index: true },
    publicKey: { type: String },
    counter: { type: Number, default: 0 },
    transports: [{ type: String }],
    secret: { type: String, select: false },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

export const CredentialModel = model<ICredential>("Credential", CredentialSchema);
