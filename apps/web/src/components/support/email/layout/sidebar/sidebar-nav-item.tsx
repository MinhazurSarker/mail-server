"use client";

import { cn } from "@/utils";
import type { SidebarNavItemProps } from "./types";

export default function SidebarNavItem({
  item,
  isActive,
  onClick,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-10 w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer text-start",
        isActive
          ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            "size-5 shrink-0 stroke-[1.5px]!",
            item.iconClassName,
            isActive
              ? "text-brand-500 dark:text-brand-400"
              : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200",
          )}
        />
        <span>{item.label}</span>
      </div>

      {item.count !== undefined && item.count > 0 && (
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full font-mono",
            isActive
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          )}
        >
          {item.count}
        </span>
      )}
    </button>
  );
}
