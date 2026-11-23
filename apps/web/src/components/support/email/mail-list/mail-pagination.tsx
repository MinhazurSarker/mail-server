"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import type { MailPaginationProps } from "./types";

export default function MailPagination({
  totalItems = 159,
}: MailPaginationProps) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-800 dark:text-white">1–11</span> of{" "}
        <span className="font-medium text-gray-800 dark:text-white">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
