"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceCardHeaderProps } from "./types";

export default function CardHeader({
  title = "Invoices",
  description = "Access all your previous invoices.",
  onDownloadAll,
  className = "",
}: InvoiceCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="default"
          onClick={onDownloadAll}
          className="h-10 rounded-[10px] border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
        >
          <DownloadIcon className="size-5" />
          <span>Download All</span>
        </Button>
      </div>
    </div>
  );
}
