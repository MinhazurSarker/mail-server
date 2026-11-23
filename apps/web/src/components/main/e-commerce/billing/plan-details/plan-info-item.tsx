import { cn } from "@/utils";
import * as React from "react";
import { PlanInfoItemProps } from "./types";

export default function PlanInfoItem({
  label,
  value,
  subtext,
  className,
}: PlanInfoItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0",
        className,
      )}
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {value}
        </span>
        {subtext && (
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
