"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { StockMetricCardProps } from "./types";

export type { StockMetricCardProps, StockMetricCardProps as MetricCardProps };

export default function MetricCard({
  symbol,
  companyName,
  price,
  change,
  direction = "up",
  icon,
  logoBg,
  badge,
  className,
  children,
}: StockMetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: logoBg }}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="font-outfit text-base font-semibold text-gray-800 dark:text-white/90">
            {symbol}
          </h3>
          <p className="font-outfit text-xs text-gray-500 dark:text-gray-400">
            {companyName}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h4 className="font-outfit text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {price}
          </h4>
        </div>

        {badge !== undefined ? (
          badge
        ) : change ? (
          <Badge color={direction === "down" ? "error" : "success"}>
            {direction === "down" ? <ArrowDownIcon /> : <ArrowUpIcon />}
            {change}
          </Badge>
        ) : null}
      </div>

      {children}
    </div>
  );
}
