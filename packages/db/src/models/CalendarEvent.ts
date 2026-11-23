import { Schema, model, type Document, Types } from "mongoose";

export interface ICalendarAttendee {
  email: string;
  name?: string;
  status: "NEEDS_ACTION" | "ACCEPTED" | "DECLINED" | "TENTATIVE";
}

export interface ICalendarEvent extends Document {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  timezone: string;
  recurrence?: string;
  attendees: ICalendarAttendee[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    allDay: { type: Boolean, default: false },
    timezone: { type: String, default: "UTC" },
    recurrence: { type: String, trim: true },
    attendees: [
      {
        email: { type: String, required: true, lowercase: true, trim: true },
        name: { type: String, trim: true },
        status: {
          type: String,
          enum: ["NEEDS_ACTION", "ACCEPTED", "DECLINED", "TENTATIVE"],
          default: "NEEDS_ACTION",
        },
      },
    ],
    color: { type: String, default: "#3b82f6" },
  },
  { timestamps: true },
);

// Compound index for querying events in date range
CalendarEventSchema.index({ userId: 1, startTime: 1, endTime: 1 });

export const CalendarEventModel = model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
