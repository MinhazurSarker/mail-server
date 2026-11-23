import { Type } from "@sinclair/typebox";

export const inputSchema = Type.Object({
  domainId: Type.String(),
  email: Type.String(),
  displayName: Type.Optional(Type.String()),
  role: Type.Optional(Type.Union([Type.Literal("ORG_ADMIN"), Type.Literal("MAILBOX_USER")])),
});

export const outputSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    email: Type.String(),
    role: Type.String(),
    status: Type.String(),
  }),
  temporaryPassword: Type.String(),
});
