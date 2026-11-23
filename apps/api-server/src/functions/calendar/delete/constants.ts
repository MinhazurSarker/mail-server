import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Delete calendar event",
  deprecated: false,
  tags: ["calendar"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  eventId: Type.String(),
});

export const outputSchema = Type.Object({
  success: Type.Boolean(),
});
