import { Schema, model, type Document, Types } from "mongoose";

export type AuthChallengeType =
  | "FIRST_LOGIN_ONBOARDING"
  | "MFA_LOGIN"
  | "PASSKEY_AUTH"
  | "PASSKEY_REG";

export type AuthChallengeStatus = "PENDING" | "CONSUMED" | "EXPIRED";

export interface IAuthChallenge extends Document {
  userId?: Types.ObjectId;
  challengeHash: string; // SHA-256 hash of plain challengeToken
  type: AuthChallengeType;
  status: AuthChallengeStatus;
  factorsRequired: string[]; // e.g. ["TOTP"], ["PASSKEY"]
  factorsVerified: string[];
  passkeyChallenge?: string; // WebAuthn challenge string
  totpSecretPending?: string; // Pending secret for onboarding setup
  userTokenVersion?: number; // User token version at challenge creation
  expectedRPID?: string;
  expectedOrigin?: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthChallengeSchema = new Schema<IAuthChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    challengeHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["FIRST_LOGIN_ONBOARDING", "MFA_LOGIN", "PASSKEY_AUTH", "PASSKEY_REG"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONSUMED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    factorsRequired: [{ type: String }],
    factorsVerified: [{ type: String }],
    passkeyChallenge: { type: String },
    totpSecretPending: { type: String, select: false },
    userTokenVersion: { type: Number },
    expectedRPID: { type: String },
    expectedOrigin: { type: String },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

export const AuthChallengeModel = model<IAuthChallenge>(
  "AuthChallenge",
  AuthChallengeSchema,
);
