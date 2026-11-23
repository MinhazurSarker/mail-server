"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { MetricCardProps } from "./types";

export type { MetricCardProps };

export default function MetricCard({
  icon,
  title,
  value,
  change,
  direction = "up",
  comparisonText,
  badge,
  className,
  children,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {icon && (
        <div className="inline-flex size-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90 [&>svg]:size-7">
          {icon}
        </div>
      )}

      <div>
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h4>

        <div className="mt-1 flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <span className="text-sm">{title}</span>

          {badge !== undefined ? (
            badge
          ) : change ? (
            <div className="flex items-center gap-1">
              <Badge
                color={
                  direction === "up"
                    ? "success"
                    : direction === "down"
                      ? "error"
                      : "warning"
                }
                size="sm"
                className="rounded-full"
              >
                <span className="text-xs">{change}</span>
              </Badge>
              {comparisonText && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comparisonText}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}
