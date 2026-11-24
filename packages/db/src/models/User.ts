import { Schema, model, type Document, Types } from "mongoose";

export interface IUser extends Document {
  organizationId: Types.ObjectId;
  domainId: Types.ObjectId;
  email: string;
  displayName?: string;
  passwordHash: string;
  role: "PLATFORM_ADMIN" | "ORG_ADMIN" | "MAILBOX_USER";
  status: "PENDING_SECURITY_SETUP" | "ACTIVE" | "LOCKED" | "SUSPENDED";
  tokenVersion: number;
  hasApiPermission: boolean;
  twoFactorEnforced: boolean;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  preferences?: {
    signature?: string;
    autoSaveDrafts?: boolean;
    sendReadReceipts?: boolean;
    desktopNotifications?: boolean;
    defaultFormat?: "html" | "text";
    theme?: "dark" | "light" | "system";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    domainId: { type: Schema.Types.ObjectId, ref: "Domain", required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    displayName: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["PLATFORM_ADMIN", "ORG_ADMIN", "MAILBOX_USER"],
      default: "MAILBOX_USER",
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING_SECURITY_SETUP", "ACTIVE", "LOCKED", "SUSPENDED"],
      default: "PENDING_SECURITY_SETUP",
      index: true,
    },
    tokenVersion: { type: Number, default: 1 },
    hasApiPermission: { type: Boolean, default: false },
    twoFactorEnforced: { type: Boolean, default: true },
    storageQuotaBytes: { type: Number, default: 10737418240 }, // 10 GB
    storageUsedBytes: { type: Number, default: 0 },
    preferences: {
      signature: { type: String, default: "" },
      autoSaveDrafts: { type: Boolean, default: true },
      sendReadReceipts: { type: Boolean, default: false },
      desktopNotifications: { type: Boolean, default: true },
      defaultFormat: { type: String, enum: ["html", "text"], default: "html" },
      theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>("User", UserSchema);
