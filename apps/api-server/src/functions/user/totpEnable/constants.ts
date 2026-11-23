import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Verify and enable TOTP for the authenticated user",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  secret: Type.String(),
  code: Type.String({ minLength: 6, maxLength: 6 }),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
