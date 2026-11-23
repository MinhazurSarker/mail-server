import { CalendarEventModel, UserModel, type ICalendarEvent, type ICalendarAttendee } from "@cellsinbox/db";

export class CalendarService {
  static async listEvents(
    userId: string,
    options: {
      startRange: Date;
      endRange: Date;
    },
  ): Promise<ICalendarEvent[]> {
    return await CalendarEventModel.find({
      userId,
      $or: [
        {
          startTime: { $gte: options.startRange, $lte: options.endRange },
        },
        {
          endTime: { $gte: options.startRange, $lte: options.endRange },
        },
        {
          startTime: { $lte: options.startRange },
          endTime: { $gte: options.endRange },
        },
      ],
    }).sort({ startTime: 1 });
  }

  static async getEventById(eventId: string, userId: string): Promise<ICalendarEvent | null> {
    return await CalendarEventModel.findOne({ _id: eventId, userId });
  }

  static async createEvent(
    userId: string,
    data: {
      title: string;
      description?: string;
      location?: string;
      startTime: Date;
      endTime: Date;
      allDay?: boolean;
      timezone?: string;
      recurrence?: string;
      attendees?: Array<{ email: string; name?: string }>;
      color?: string;
    },
  ): Promise<ICalendarEvent> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found.");

    if (new Date(data.endTime) < new Date(data.startTime)) {
      throw new Error("Event end time cannot be before start time.");
    }

    const attendees: ICalendarAttendee[] = (data.attendees || []).map((att) => ({
      email: att.email.toLowerCase().trim(),
      name: att.name?.trim(),
      status: "NEEDS_ACTION",
    }));

    const event = new CalendarEventModel({
      organizationId: user.organizationId,
      userId: user._id,
      title: data.title.trim(),
      description: data.description?.trim(),
      location: data.location?.trim(),
      startTime: data.startTime,
      endTime: data.endTime,
      allDay: data.allDay === true,
      timezone: data.timezone || "UTC",
      recurrence: data.recurrence?.trim(),
      attendees,
      color: data.color || "#3b82f6",
    });

    return await event.save();
  }

  static async updateEvent(
    eventId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      location?: string;
      startTime?: Date;
      endTime?: Date;
      allDay?: boolean;
      timezone?: string;
      recurrence?: string;
      attendees?: Array<{ email: string; name?: string; status?: any }>;
      color?: string;
    },
  ): Promise<ICalendarEvent> {
    const update: Record<string, any> = {};
    if (data.title !== undefined) update.title = data.title.trim();
    if (data.description !== undefined) update.description = data.description.trim();
    if (data.location !== undefined) update.location = data.location.trim();
    if (data.startTime !== undefined) update.startTime = data.startTime;
    if (data.endTime !== undefined) update.endTime = data.endTime;
    if (data.allDay !== undefined) update.allDay = data.allDay;
    if (data.timezone !== undefined) update.timezone = data.timezone;
    if (data.recurrence !== undefined) update.recurrence = data.recurrence;
    if (data.color !== undefined) update.color = data.color;
    if (data.attendees !== undefined) {
      update.attendees = data.attendees.map((att) => ({
        email: att.email.toLowerCase().trim(),
        name: att.name?.trim(),
        status: att.status || "NEEDS_ACTION",
      }));
    }

    if (update.startTime && update.endTime && new Date(update.endTime) < new Date(update.startTime)) {
      throw new Error("Event end time cannot be before start time.");
    }

    const event = await CalendarEventModel.findOneAndUpdate(
      { _id: eventId, userId },
      { $set: update },
      { new: true },
    );

    if (!event) throw new Error("Event not found or access denied.");
    return event;
  }

  static async deleteEvent(eventId: string, userId: string): Promise<void> {
    const res = await CalendarEventModel.deleteOne({ _id: eventId, userId });
    if (res.deletedCount === 0) {
      throw new Error("Event not found or access denied.");
    }
  }

  static async respondToInvite(
    eventId: string,
    userEmail: string,
    status: "ACCEPTED" | "DECLINED" | "TENTATIVE",
  ): Promise<ICalendarEvent> {
    const cleanEmail = userEmail.toLowerCase().trim();
    const event = await CalendarEventModel.findOneAndUpdate(
      { _id: eventId, "attendees.email": cleanEmail },
      { $set: { "attendees.$.status": status } },
      { new: true },
    );

    if (!event) throw new Error("Event not found or user is not an attendee.");
    return event;
  }
}
