"use client";

import { TagIcon } from "@/icons";
import { cn } from "@/utils";
import type { SidebarLabelItemProps } from "./types";

export default function SidebarLabelItem({
  item,
  isActive,
  onClick,
}: SidebarLabelItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-9 w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
      )}
    >
      <div className="flex items-center gap-2.5">
        <TagIcon className={cn("size-3.5 shrink-0 rtl:rotate-180", item.colorClass)} />
        <span className="text-xs">{item.label}</span>
      </div>

      {item.count !== undefined && item.count > 0 && (
        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 font-mono">
          {item.count}
        </span>
      )}
    </button>
  );
}
