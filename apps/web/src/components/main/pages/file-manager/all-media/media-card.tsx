import { cn } from "@/utils";
import * as React from "react";
import { MediaCardProps } from "./types";

export default function MediaCard({ item, className }: MediaCardProps) {
  const { icon, title, usage, fileCount, storageUsed, iconStyle } = item;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 pe-4 xl:pe-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-[52px] items-center justify-center rounded-xl",
            iconStyle,
          )}
        >
          {icon}
        </div>
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {title}
          </h4>
          <span className="block text-sm text-gray-500 dark:text-gray-400">
            {usage}
          </span>
        </div>
      </div>

      <div>
        <span className="mb-1 block text-end text-sm text-gray-500 dark:text-gray-400">
          {fileCount} files
        </span>
        <span className="block text-end text-sm text-gray-500 dark:text-gray-400">
          {storageUsed}
        </span>
      </div>
    </div>
  );
}
