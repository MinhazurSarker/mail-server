import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get user settings and mail preferences",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  displayName: Type.String(),
  role: Type.String(),
  twoFactorEnforced: Type.Boolean(),
  storageQuotaBytes: Type.Number(),
  storageUsedBytes: Type.Number(),
  preferences: Type.Object({
    signature: Type.String(),
    autoSaveDrafts: Type.Boolean(),
    sendReadReceipts: Type.Boolean(),
    desktopNotifications: Type.Boolean(),
    defaultFormat: Type.Union([Type.Literal("html"), Type.Literal("text")]),
    theme: Type.Union([Type.Literal("dark"), Type.Literal("light"), Type.Literal("system")]),
  }),
});
