import { Schema, model, type Document, Types } from "mongoose";

export interface IAttachment extends Document {
  messageId: Types.ObjectId;
  filename: string;
  contentType: string;
  sizeBytes: number;
  contentId?: string;
  s3ObjectKey: string;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
    filename: { type: String, required: true, trim: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    contentId: { type: String },
    s3ObjectKey: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AttachmentModel = model<IAttachment>("Attachment", AttachmentSchema);
