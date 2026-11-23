export type MeetingKey = "productSync" | "frontendInterview";
export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Participant {
  name: string;
  avatar: string;
}

export interface MeetingItem {
  id: string;
  key?: MeetingKey;
  title?: string;
  time: string;
  participants: Participant[];
  extraParticipantsCount?: number;
  date?: number;
  format?: "online" | "in-person";
  category?: string;
}

export interface ScheduleDay {
  key: DayKey;
  date: number;
  isActive?: boolean;
}

export interface DaysRowProps {
  days: ScheduleDay[];
  activeDay: number;
  onSelectDay: (date: number) => void;
  className?: string;
}

export interface AddMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMeeting: (meeting: MeetingItem) => void;
  activeDate?: number;
}

export interface InterviewAndMeetingsProps {
  className?: string;
}
