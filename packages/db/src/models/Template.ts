import { Schema, model, type Document, Types } from "mongoose";

export interface ITemplate extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, default: "" },
    bodyHtml: { type: String, default: "" },
    bodyText: { type: String, default: "" },
    variables: [{ type: String, trim: true }],
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

export const TemplateModel = model<ITemplate>("Template", TemplateSchema);
