"use client";

import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { StatCardProps } from "./types";

export type { StatCardProps };

export default function StatCard({
  icon,
  title,
  value,
  change,
  direction = "up",
  comparisonText,
  badge,
  className,
  children,
}: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl p-5 sm:p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {icon}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h3>

        <div className="flex items-center justify-between">
          {comparisonText && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comparisonText}
            </span>
          )}

          {badge !== undefined ? (
            badge
          ) : change ? (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                direction === "down"
                  ? "text-red-600 dark:text-red-500"
                  : "text-green-600 dark:text-green-500",
              )}
            >
              {direction === "down" ? (
                <ArrowDownIcon className="size-3.5" />
              ) : (
                <ArrowUpIcon className="size-3.5" />
              )}
              {change}
            </span>
          ) : null}
        </div>
      </div>

      {children}
    </Card>
  );
}

export { StatCard as MetricCard };
