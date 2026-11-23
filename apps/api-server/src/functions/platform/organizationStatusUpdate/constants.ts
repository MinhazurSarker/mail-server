import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Update organization status (ACTIVE or SUSPENDED)",
  deprecated: false,
  tags: ["platform"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  organizationId: Type.String(),
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("SUSPENDED")]),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
  status: Type.String(),
});
