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
        "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {icon && (
        <div className="mb-6 flex size-13 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/90 [&>svg]:size-6">
          {icon}
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
              {value}
            </h4>
          </div>

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
