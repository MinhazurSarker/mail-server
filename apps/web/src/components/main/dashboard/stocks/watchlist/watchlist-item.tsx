"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { WatchlistItemProps } from "./types";

export default function WatchlistItem({
  symbol,
  companyName,
  price,
  change,
  direction,
  logoBg,
  icon,
  className,
}: WatchlistItemProps) {
  const isUp = direction === "up";

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-gray-100 py-4 first:pt-0 last:border-b-0 last:pb-0 dark:border-gray-800",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
            style={logoBg ? { backgroundColor: logoBg } : undefined}
          >
            {icon}
          </div>
        )}

        <div>
          <h4 className="font-outfit text-base font-semibold text-gray-800 dark:text-white/90">
            {symbol}
          </h4>
          <span className="block font-outfit text-xs font-normal text-gray-500 dark:text-gray-400">
            {companyName}
          </span>
        </div>
      </div>

      <div>
        <h5 className="mb-1 text-end font-outfit text-sm font-medium text-gray-700 dark:text-gray-300">
          {price}
        </h5>
        <span
          className={cn(
            "flex items-center justify-end gap-1 font-outfit text-xs font-medium",
            isUp
              ? "text-green-600 dark:text-green-500"
              : "text-red-600 dark:text-red-500",
          )}
        >
          {isUp ? (
            <ArrowUpIcon className="size-3.5 rotate-45" />
          ) : (
            <ArrowDownIcon className="size-3.5 rotate-45" />
          )}
          {change}
        </span>
      </div>
    </div>
  );
}
