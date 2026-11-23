import { Schema, model, type Document, Types } from "mongoose";

export interface IMessageBody extends Document {
  messageId: Types.ObjectId;
  text?: string;
  html?: string;
  snippet: string;
}

const MessageBodySchema = new Schema<IMessageBody>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, unique: true, index: true },
    text: { type: String },
    html: { type: String },
    snippet: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: false },
);

export const MessageBodyModel = model<IMessageBody>("MessageBody", MessageBodySchema);
