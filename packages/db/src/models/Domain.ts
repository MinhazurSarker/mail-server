import { Schema, model, type Document, Types } from "mongoose";

export interface IDomain extends Document {
  organizationId: Types.ObjectId;
  name: string;
  isVerified: boolean;
  verificationToken: string;
  dkimSelector: string;
  dkimPrivateKey?: string;
  dkimPublicKey: string;
  spfStatus: "PENDING" | "VERIFIED" | "FAILED";
  dkimStatus: "PENDING" | "VERIFIED" | "FAILED";
  dmarcStatus: "PENDING" | "VERIFIED" | "FAILED";
  mxStatus: "PENDING" | "VERIFIED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

const DomainSchema = new Schema<IDomain>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    isVerified: { type: Boolean, default: false, index: true },
    verificationToken: { type: String, required: true },
    dkimSelector: { type: String, default: "ci" },
    dkimPrivateKey: { type: String, select: false }, // Hidden by default for security
    dkimPublicKey: { type: String, required: true },
    spfStatus: { type: String, enum: ["PENDING", "VERIFIED", "FAILED"], default: "PENDING" },
    dkimStatus: { type: String, enum: ["PENDING", "VERIFIED", "FAILED"], default: "PENDING" },
    dmarcStatus: { type: String, enum: ["PENDING", "VERIFIED", "FAILED"], default: "PENDING" },
    mxStatus: { type: String, enum: ["PENDING", "VERIFIED", "FAILED"], default: "PENDING" },
  },
  { timestamps: true },
);

export const DomainModel = model<IDomain>("Domain", DomainSchema);
