"use client";

import { AngleDownIcon, AngleUpIcon } from "@/icons";
import { cn } from "@/utils";

export interface ColumnHeaderProps {
  title: string;
  isSorted: false | "asc" | "desc";
  onToggleSorting?: (event: unknown) => void;
  className?: string;
}

export default function ColumnHeader({
  title,
  isSorted,
  onToggleSorting,
  className,
}: ColumnHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggleSorting}
      className={cn(
        "group flex w-full items-center justify-between gap-2 text-start focus:outline-hidden",
        className,
      )}
    >
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {title}
      </span>
      <span className="flex flex-col gap-0.5" aria-hidden="true">
        <AngleUpIcon
          className={cn(
            "size-2 transition-colors",
            isSorted === "asc"
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500",
          )}
        />
        <AngleDownIcon
          className={cn(
            "size-2 transition-colors",
            isSorted === "desc"
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-300 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500",
          )}
        />
      </span>
    </button>
  );
}
