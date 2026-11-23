"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AddMeetingDialog from "./add-meeting-dialog";
import { meetingsData, scheduleDaysData } from "./data";
import DaysRow from "./days-row";
import MeetingCard from "./meeting-card";
import { InterviewAndMeetingsProps, MeetingItem } from "./types";

export default function InterviewAndMeetings({
  className,
}: InterviewAndMeetingsProps) {
  const t = useTranslations("hr.interviewAndMeetings");
  const [activeDay, setActiveDay] = useState(21);
  const [meetings, setMeetings] = useState<MeetingItem[]>(meetingsData);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  const handlePrevDate = () => {
    setActiveDay((current) => {
      const idx = scheduleDaysData.findIndex((d) => d.date === current);
      if (idx <= 0) return scheduleDaysData[scheduleDaysData.length - 1].date;
      return scheduleDaysData[idx - 1].date;
    });
  };

  const handleNextDate = () => {
    setActiveDay((current) => {
      const idx = scheduleDaysData.findIndex((d) => d.date === current);
      if (idx === -1 || idx >= scheduleDaysData.length - 1) {
        return scheduleDaysData[0].date;
      }
      return scheduleDaysData[idx + 1].date;
    });
  };

  const handleAddMeeting = (newMeeting: MeetingItem) => {
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => setIsAddMeetingOpen(true)}
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
          aria-label="Add meeting"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {/* Mini Schedule Calendar */}
      <div className="mt-5 border-b border-gray-200 pb-5 dark:border-gray-800">
        {/* Month Navigator */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-white/3">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={handlePrevDate}
            className="size-7 bg-white dark:border-gray-700 dark:bg-gray-800"
            aria-label="Previous date"
          >
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
          </Button>

          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            January 2027
          </span>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={handleNextDate}
            className="size-7 bg-white dark:border-gray-700 dark:bg-gray-800"
            aria-label="Next date"
          >
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
          </Button>
        </div>

        {/* Days Row */}
        <DaysRow
          days={scheduleDaysData}
          activeDay={activeDay}
          onSelectDay={setActiveDay}
        />
      </div>

      {/* Meeting Cards List wrapped with ScrollArea */}
      <ScrollArea
        scrollbars="vertical"
        className="mt-5 max-h-75 pe-1"
        viewportClassName="max-h-[300px]"
      >
        <div className="space-y-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </ScrollArea>

      {/* Add Meeting Dialog */}
      <AddMeetingDialog
        isOpen={isAddMeetingOpen}
        onOpenChange={setIsAddMeetingOpen}
        onAddMeeting={handleAddMeeting}
        activeDate={activeDay}
      />
    </div>
  );
}
