import { Schema, model, type Document, Types } from "mongoose";

export interface IMailboxState extends Document {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  folder: "INBOX" | "SENT" | "DRAFTS" | "TRASH" | "SPAM" | "ARCHIVE" | "CUSTOM";
  customFolderId?: Types.ObjectId;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MailboxStateSchema = new Schema<IMailboxState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
    folder: {
      type: String,
      enum: ["INBOX", "SENT", "DRAFTS", "TRASH", "SPAM", "ARCHIVE", "CUSTOM"],
      default: "INBOX",
      index: true,
    },
    customFolderId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
    isStarred: { type: Boolean, default: false, index: true },
    labels: [{ type: String }],
  },
  { timestamps: true },
);

MailboxStateSchema.index({ userId: 1, folder: 1, createdAt: -1 });
MailboxStateSchema.index({ userId: 1, messageId: 1 }, { unique: true });

export const MailboxStateModel = model<IMailboxState>("MailboxState", MailboxStateSchema);
