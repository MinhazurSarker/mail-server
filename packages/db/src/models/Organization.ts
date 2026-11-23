import { Schema, model, type Document } from "mongoose";

export interface IOrganizationBranding {
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  primaryColor?: string;
}

export interface IOrganization extends Document {
  name: string;
  slug: string;
  status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
  branding?: IOrganizationBranding;
  customWebmailDomains?: string[];
  storageConfig?: {
    provider: "cloudflare_r2" | "aws_s3" | "minio" | "custom_s3" | "local_fallback";
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicUrlPrefix?: string;
  };
  sesBackupConfig?: {
    enabled: boolean;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    fromEmail?: string;
  };
  policyConfig?: {
    enforceTwoFactor?: boolean;
    spamThresholdScore?: number;
    rejectUnverifiableSpf?: boolean;
    rejectUnverifiableDkim?: boolean;
    maxSingleFileSizeBytes?: number;
    maxAttachmentCount?: number;
    defaultUserStorageBytes?: number;
  };
  maxDomains: number;
  maxUsers: number;
  maxStorageBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED"],
      default: "PENDING_APPROVAL",
      index: true,
    },
    storageConfig: {
      provider: { type: String, enum: ["cloudflare_r2", "aws_s3", "minio", "custom_s3", "local_fallback"] },
      endpoint: { type: String },
      bucket: { type: String },
      region: { type: String, default: "auto" },
      accessKeyId: { type: String },
      secretAccessKey: { type: String },
      publicUrlPrefix: { type: String },
    },
    sesBackupConfig: {
      enabled: { type: Boolean, default: false },
      region: { type: String, default: "us-east-1" },
      accessKeyId: { type: String },
      secretAccessKey: { type: String },
      fromEmail: { type: String },
    },
    policyConfig: {
      enforceTwoFactor: { type: Boolean, default: true },
      spamThresholdScore: { type: Number, default: 5 },
      rejectUnverifiableSpf: { type: Boolean, default: false },
      rejectUnverifiableDkim: { type: Boolean, default: false },
      maxSingleFileSizeBytes: { type: Number, default: 26214400 }, // 25 MB default (-1 = unlimited)
      maxAttachmentCount: { type: Number, default: 10 }, // 10 attachments default (-1 = unlimited)
      defaultUserStorageBytes: { type: Number, default: 10737418240 }, // 10 GB default (-1 = unlimited)
    },
    branding: {
      logoUrl: { type: String, trim: true },
      faviconUrl: { type: String, trim: true },
      companyName: { type: String, trim: true },
      primaryColor: { type: String, trim: true },
    },
    customWebmailDomains: [{ type: String, lowercase: true, trim: true, index: true }],
    maxDomains: { type: Number, default: 5 },
    maxUsers: { type: Number, default: 50 },
    maxStorageBytes: { type: Number, default: 107374182400 }, // 100 GB
  },
  { timestamps: true },
);

export const OrganizationModel = model<IOrganization>("Organization", OrganizationSchema);
