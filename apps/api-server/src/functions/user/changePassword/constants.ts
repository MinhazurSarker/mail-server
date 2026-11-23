import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Change current user password",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({ minLength: 8 }),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
