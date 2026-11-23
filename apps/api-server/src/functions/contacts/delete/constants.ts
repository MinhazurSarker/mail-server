import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Delete contact",
  deprecated: false,
  tags: ["contacts"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  contactId: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
