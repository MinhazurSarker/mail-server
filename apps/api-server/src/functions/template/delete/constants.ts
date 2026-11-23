import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Delete an email template",
  deprecated: false,
  tags: ["template"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  id: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
