"use client";

import { cn } from "@/utils";
import { MetricCardProps } from "./types";

export default function MetricCard({
  title,
  value,
  icon,
  percentage,
  change,
  comparisonText,
  isPositive = true,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-white p-5 dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {title}
        </span>
        {icon}
      </div>

      <h2 className="mb-1 text-xl font-medium text-gray-800 dark:text-white/90">
        {value}
      </h2>

      <div className="flex items-center gap-1 text-xs">
        {percentage && (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {percentage}
          </span>
        )}
        {change && (
          <span
            className={cn(
              "text-sm font-medium",
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500",
            )}
          >
            {change}
          </span>
        )}
        {comparisonText && (
          <span className="text-gray-400">{comparisonText}</span>
        )}
      </div>
    </div>
  );
}
