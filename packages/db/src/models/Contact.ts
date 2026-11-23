import { Schema, model, type Document, Types } from "mongoose";

export interface IContact extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    notes: { type: String, trim: true },
    isFavorite: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Compound indexes for fast searching and autocompletion
ContactSchema.index({ userId: 1, name: 1 });
ContactSchema.index({ userId: 1, email: 1 });
ContactSchema.index({ userId: 1, isFavorite: 1 });

export const ContactModel = model<IContact>("Contact", ContactSchema);
