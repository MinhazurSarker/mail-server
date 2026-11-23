"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/utils";
import { MeetingItem } from "./types";

interface MeetingCardProps {
  meeting: MeetingItem;
  className?: string;
}

const defaultMeetingTitles: Record<string, string> = {
  productSync: "Product Team Sync",
  frontendInterview: "Interview Candidates - Frontend Developer",
};

export default function MeetingCard({ meeting, className }: MeetingCardProps) {
  const meetingTitle =
    meeting.title ??
    (meeting.key ? defaultMeetingTitles[meeting.key] : "Meeting");

  return (
    <div
      className={cn(
        "rounded-xl bg-gray-50 p-4 transition-colors dark:bg-white/3",
        className,
      )}
    >
      <div>
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {meetingTitle}
        </h4>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {meeting.time}
        </p>
      </div>

      <div className="my-3.5 border-b border-dashed border-gray-200 dark:border-gray-800" />

      <div className="flex items-center justify-between">
        {/* Avatars Stack */}
        <AvatarGroup className="rtl:space-x-reverse">
          {meeting.participants.slice(0, 5).map((p, idx) => (
            <Avatar key={idx} size="xs">
              <AvatarImage src={p.avatar} alt={p.name} />
              <AvatarFallback>
                {p.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {meeting.extraParticipantsCount ? (
            <AvatarGroupCount className="text-[10px] font-medium">
              +{meeting.extraParticipantsCount}
            </AvatarGroupCount>
          ) : null}
        </AvatarGroup>

        {/* Join Now Button */}
        <button
          type="button"
          className="rounded-md border border-brand-500 px-2.5 py-1 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 cursor-pointer"
        >
          Join Now
        </button>
      </div>
    </div>
  );
}
