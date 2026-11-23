import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  inboxUnread: Type.Number(),
  inboxTotal: Type.Number(),
  starred: Type.Number(),
  sent: Type.Number(),
  drafts: Type.Number(),
  trash: Type.Number(),
});
