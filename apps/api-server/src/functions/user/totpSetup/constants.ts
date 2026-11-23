import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Initiate TOTP setup for the authenticated user",
  deprecated: false,
  tags: ["user"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({});

export const outputSchema = Type.Object({
  secret: Type.String(),
  otpauthUri: Type.String(),
});
