"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { cn } from "@/utils";

export interface CardFooterProps {
  pageIndex: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  className?: string;
}

export default function CardFooter({
  pageIndex,
  pageSize,
  totalEntries,
  totalPages,
  onPageChange,
  className,
}: CardFooterProps) {
  const currentPage = pageIndex + 1;
  const startEntry = totalEntries === 0 ? 0 : pageIndex * pageSize + 1;
  const endEntry = Math.min((pageIndex + 1) * pageSize, totalEntries);

  const getPageNumbers = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-start",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-start",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-end",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800",
        className,
      )}
    >
      {/* Entries Info */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Showing {startEntry} to {endEntry} of {totalEntries} entries
      </p>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 0}
            className="flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1.5">
            {pages.map((item, index) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex size-10 items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = item;
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum - 1)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[10px] text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-500 text-white shadow-theme-xs"
                      : "border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1}
            className="flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
            aria-label="Next page"
          >
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
