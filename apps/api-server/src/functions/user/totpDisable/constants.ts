import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Disable TOTP for authenticated user with password confirmation",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  password: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
