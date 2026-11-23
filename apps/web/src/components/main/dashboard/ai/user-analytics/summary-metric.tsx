"use client";

import { UsersIcon } from "@/icons";
import { cn } from "@/utils";
import { SummaryMetricProps } from "./types";

export default function SummaryMetric({
  title,
  value,
  icon = <UsersIcon className="size-6 text-gray-500 dark:text-gray-400" />,
  className,
}: SummaryMetricProps) {
  return (
    <div
      className={cn("mb-3 flex items-center justify-between gap-4", className)}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-gray-500 dark:text-white/90">{title}</span>
      </div>
      <div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-white/90">
          {value}
        </h3>
      </div>
    </div>
  );
}
