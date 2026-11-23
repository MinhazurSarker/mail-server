import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "List calendar events within a date range",
  deprecated: false,
  tags: ["calendar"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  startRange: Type.String({ description: "ISO 8601 start timestamp" }),
  endRange: Type.String({ description: "ISO 8601 end timestamp" }),
});

export const outputSchema = Type.Object({
  items: Type.Array(
    Type.Object({
      id: Type.String(),
      title: Type.String(),
      description: Type.Optional(Type.String()),
      location: Type.Optional(Type.String()),
      startTime: Type.String(),
      endTime: Type.String(),
      allDay: Type.Boolean(),
      timezone: Type.String(),
      recurrence: Type.Optional(Type.String()),
      color: Type.String(),
      attendees: Type.Array(
        Type.Object({
          email: Type.String(),
          name: Type.Optional(Type.String()),
          status: Type.String(),
        }),
      ),
      createdAt: Type.String(),
    }),
  ),
});
