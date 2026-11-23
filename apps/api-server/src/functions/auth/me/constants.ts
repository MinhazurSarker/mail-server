import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Get authenticated user profile from session context",
  deprecated: false,
  tags: ["auth"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  token: Type.Optional(Type.String({ description: "Optional token if not passed in Authorization header" })),
});

export const outputSchema = Type.Object({
  userId: Type.String(),
  organizationId: Type.String(),
  domainId: Type.String(),
  email: Type.String(),
  role: Type.String(),
  status: Type.String(),
});
