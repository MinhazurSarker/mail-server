"use client";

import { cn } from "@/utils";
import { DaysRowProps } from "./types";

const dayLabels: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export default function DaysRow({
  days,
  activeDay,
  onSelectDay,
  className,
}: DaysRowProps) {
  return (
    <div
      className={cn(
        "mt-3 flex items-center justify-between gap-1 sm:gap-2",
        className,
      )}
    >
      {days.map((item) => {
        const isSelected = activeDay === item.date;
        return (
          <button
            key={item.date}
            type="button"
            onClick={() => onSelectDay(item.date)}
            className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {dayLabels[item.key] ?? item.key.toUpperCase()}
            </span>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors sm:size-9 sm:text-sm",
                isSelected
                  ? "bg-brand-500 text-white shadow-sm ring-2 ring-brand-500/30"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              {item.date}
            </span>
          </button>
        );
      })}
    </div>
  );
}
