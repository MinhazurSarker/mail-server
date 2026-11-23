import { Type, type Static } from "@sinclair/typebox";

export const EmailAddressSchema = Type.Object({
  name: Type.Optional(Type.String()),
  address: Type.String({ minLength: 3 }),
});
export type EmailAddress = Static<typeof EmailAddressSchema>;

export const MessageSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  messageId: Type.String({ description: "RFC 5322 Message-ID" }),
  inReplyTo: Type.Optional(Type.String()),
  references: Type.Array(Type.String(), { default: [] }),
  from: EmailAddressSchema,
  to: Type.Array(EmailAddressSchema),
  cc: Type.Array(EmailAddressSchema, { default: [] }),
  bcc: Type.Array(EmailAddressSchema, { default: [] }),
  replyTo: Type.Optional(Type.Array(EmailAddressSchema)),
  subject: Type.String({ default: "(No Subject)" }),
  date: Type.String(),
  s3RawKey: Type.String({ description: "Object key in tenant S3/R2 bucket" }),
  sizeBytes: Type.Number({ default: 0 }),
  hasAttachments: Type.Boolean({ default: false }),
  spfResult: Type.Optional(Type.String()),
  dkimResult: Type.Optional(Type.String()),
  dmarcResult: Type.Optional(Type.String()),
  createdAt: Type.String(),
});
export type Message = Static<typeof MessageSchema>;

export const MessageBodySchema = Type.Object({
  id: Type.String(),
  messageId: Type.String(),
  text: Type.Optional(Type.String()),
  html: Type.Optional(Type.String()),
  snippet: Type.String({ maxLength: 250, default: "" }),
});
export type MessageBody = Static<typeof MessageBodySchema>;

export const AttachmentSchema = Type.Object({
  id: Type.String(),
  messageId: Type.String(),
  filename: Type.String(),
  contentType: Type.String(),
  sizeBytes: Type.Number(),
  contentId: Type.Optional(Type.String({ description: "For inline CID images" })),
  s3ObjectKey: Type.String({ description: "Object key in tenant S3/R2" }),
  createdAt: Type.String(),
});
export type Attachment = Static<typeof AttachmentSchema>;

export const MailboxFolderSchema = Type.Union([
  Type.Literal("INBOX"),
  Type.Literal("SENT"),
  Type.Literal("DRAFTS"),
  Type.Literal("TRASH"),
  Type.Literal("SPAM"),
  Type.Literal("ARCHIVE"),
  Type.Literal("CUSTOM"),
]);
export type MailboxFolder = Static<typeof MailboxFolderSchema>;

export const MailboxStateSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  messageId: Type.String(),
  folder: MailboxFolderSchema,
  customFolderId: Type.Optional(Type.String()),
  isRead: Type.Boolean({ default: false }),
  isStarred: Type.Boolean({ default: false }),
  labels: Type.Array(Type.String(), { default: [] }),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type MailboxState = Static<typeof MailboxStateSchema>;

export const DeliveryStatusSchema = Type.Union([
  Type.Literal("PENDING"),
  Type.Literal("IN_PROGRESS"),
  Type.Literal("FAILED"),
  Type.Literal("DELIVERED"),
  Type.Literal("BOUNCED"),
]);
export type DeliveryStatus = Static<typeof DeliveryStatusSchema>;

export const DeliveryQueueSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  messageId: Type.String(),
  sender: Type.String(),
  recipient: Type.String(),
  status: DeliveryStatusSchema,
  attempts: Type.Number({ default: 0 }),
  maxAttempts: Type.Number({ default: 5 }),
  nextAttemptAt: Type.String(),
  lastError: Type.Optional(Type.String()),
  smtpResponseCode: Type.Optional(Type.Number()),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
export type DeliveryQueue = Static<typeof DeliveryQueueSchema>;
