import { Type } from "@sinclair/typebox";

export const metadata = {
  description: "Create a new calendar event",
  deprecated: false,
  tags: ["calendar"],
};

export const contentType = "application/json" as const;

export const inputSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  location: Type.Optional(Type.String()),
  startTime: Type.String(),
  endTime: Type.String(),
  allDay: Type.Optional(Type.Boolean()),
  timezone: Type.Optional(Type.String()),
  recurrence: Type.Optional(Type.String()),
  attendees: Type.Optional(
    Type.Array(
      Type.Object({
        email: Type.String(),
        name: Type.Optional(Type.String()),
      }),
    ),
  ),
  color: Type.Optional(Type.String()),
});

export const outputSchema = Type.Object({
  event: Type.Object({
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
});
