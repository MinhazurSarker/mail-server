import type { Static } from "@sinclair/typebox";
import type { MiddlewareContext } from "@cellsweb/rpc-core";
import { CalendarService } from "@cellsinbox/service";
import type { AuthContext } from "../../../middlewares/auth/run.js";
import type { inputSchema, outputSchema } from "./constants.js";

type Input = Static<typeof inputSchema>;
type Output = Static<typeof outputSchema>;

export const run = async (
  input: Input,
  context: MiddlewareContext & { auth?: AuthContext },
): Promise<Output> => {
  const authUser = context.auth;
  if (!authUser) throw new Error("Unauthorized");

  const e = await CalendarService.updateEvent(input.eventId, authUser.userId, {
    title: input.title,
    description: input.description,
    location: input.location,
    startTime: input.startTime ? new Date(input.startTime) : undefined,
    endTime: input.endTime ? new Date(input.endTime) : undefined,
    allDay: input.allDay,
    timezone: input.timezone,
    recurrence: input.recurrence,
    attendees: input.attendees as any,
    color: input.color,
  });

  return {
    event: {
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      location: e.location,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      allDay: e.allDay,
      timezone: e.timezone,
      recurrence: e.recurrence,
      color: e.color,
      attendees: e.attendees.map((a) => ({
        email: a.email,
        name: a.name,
        status: a.status,
      })),
      createdAt: e.createdAt.toISOString(),
    },
  };
};
