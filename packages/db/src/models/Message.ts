import { Schema, model, type Document, Types } from "mongoose";

export interface IEmailAddress {
  name?: string;
  address: string;
}

export interface IMessage extends Document {
  organizationId: Types.ObjectId;
  messageId: string;
  inReplyTo?: string;
  references: string[];
  from: IEmailAddress;
  to: IEmailAddress[];
  cc: IEmailAddress[];
  bcc: IEmailAddress[];
  replyTo?: IEmailAddress[];
  subject: string;
  date: Date;
  s3RawKey: string;
  sizeBytes: number;
  hasAttachments: boolean;
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  createdAt: Date;
}

const EmailAddressSchema = new Schema<IEmailAddress>(
  {
    name: { type: String, trim: true },
    address: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    messageId: { type: String, required: true, index: true },
    inReplyTo: { type: String, index: true },
    references: [{ type: String }],
    from: { type: EmailAddressSchema, required: true },
    to: [{ type: EmailAddressSchema, required: true }],
    cc: [{ type: EmailAddressSchema }],
    bcc: [{ type: EmailAddressSchema }],
    replyTo: [{ type: EmailAddressSchema }],
    subject: { type: String, default: "(No Subject)", trim: true },
    date: { type: Date, required: true, index: true },
    s3RawKey: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    hasAttachments: { type: Boolean, default: false },
    spfResult: { type: String },
    dkimResult: { type: String },
    dmarcResult: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.index({ organizationId: 1, date: -1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
