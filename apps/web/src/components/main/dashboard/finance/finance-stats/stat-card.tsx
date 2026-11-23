"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { ArrowDownTrendingIcon, ArrowUpTrendingIcon } from "./icons";
import { StatCardProps } from "./types";

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
    <Card
      className={cn(
        "flex flex-col justify-between rounded-xl border-none bg-white p-6 shadow-none dark:border-none dark:bg-gray-900",
        className,
      )}
    >
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-base text-gray-500 dark:text-gray-400">{title}</p>
          {icon && <span>{icon}</span>}
        </div>
        <h2 className="text-3xl font-medium text-gray-700 dark:text-white/90">
          {value}
        </h2>
      </div>

      <p
        className={cn(
          "flex items-center text-sm font-normal text-gray-500 dark:text-gray-400",
          badge !== undefined ? "gap-2.5" : "gap-1.5",
        )}
      >
        {badge !== undefined ? (
          badge
        ) : change ? (
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              direction === "down" ? "text-red-600" : "text-green-600",
            )}
          >
            {direction === "down" ? (
              <ArrowDownTrendingIcon className="rotate-45" />
            ) : (
              <ArrowUpTrendingIcon className="rotate-45" />
            )}
            {change}
          </span>
        ) : null}
        {comparisonText && <span>{comparisonText}</span>}
      </p>

      {children}
    </Card>
  );
}
