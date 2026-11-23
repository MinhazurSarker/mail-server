import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Update user settings and mail preferences",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  displayName: Type.Optional(Type.String()),
  preferences: Type.Optional(
    Type.Object({
      signature: Type.Optional(Type.String()),
      autoSaveDrafts: Type.Optional(Type.Boolean()),
      sendReadReceipts: Type.Optional(Type.Boolean()),
      desktopNotifications: Type.Optional(Type.Boolean()),
      defaultFormat: Type.Optional(Type.Union([Type.Literal("html"), Type.Literal("text")])),
      theme: Type.Optional(Type.Union([Type.Literal("dark"), Type.Literal("light"), Type.Literal("system")])),
    }),
  ),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
