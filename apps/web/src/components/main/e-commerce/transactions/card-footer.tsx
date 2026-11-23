"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/utils";
import { TransactionCardFooterProps } from "./types";

export default function CardFooter({
  currentPage = 1,
  totalPages = 10,
  totalItems = 1000,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}: TransactionCardFooterProps) {
  const getPageNumbers = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [
        1,
        2,
        3,
        "ellipsis-end",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        2,
        3,
        "ellipsis-start",
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
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800",
        className,
      )}
    >
      {/* Items count summary */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-medium text-gray-800 dark:text-white/90">
          {startItem} to {endItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-800 dark:text-white/90">
          {totalItems}
        </span>
      </p>

      {/* Mobile Pagination (< sm) */}
      <div className="flex w-full items-center justify-between sm:hidden">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
          {currentPage}/{totalPages}
        </span>

        <div className="flex items-center gap-2">
          <PaginationPrevious
            href="#"
            size="icon"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange?.(currentPage - 1);
            }}
            className="size-10 rounded-[10px] border-gray-300 dark:border-gray-700"
          />
          <PaginationNext
            href="#"
            size="icon"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange?.(currentPage + 1);
            }}
            className="size-10 rounded-[10px] border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Desktop Pagination (>= sm) */}
      <div className="hidden sm:flex sm:items-center sm:justify-end">
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                size="icon"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange?.(currentPage - 1);
                }}
                className="size-10 rounded-[10px] border-gray-300 dark:border-gray-700"
              />
            </PaginationItem>

            {pages.map((item, index) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={`${item}-${index}`}>
                    <span
                      aria-hidden="true"
                      className="flex size-10 select-none items-center justify-center rounded-[10px] border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    >
                      ...
                    </span>
                  </PaginationItem>
                );
              }

              const page = item;
              const isActive = currentPage === page;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    size="icon"
                    variant="outline"
                    isActive={isActive}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange?.(page);
                    }}
                    className={cn(
                      "size-10 rounded-[10px] text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-500 dark:text-white"
                        : "border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white",
                    )}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                size="icon"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange?.(currentPage + 1);
                }}
                className="size-10 rounded-[10px] border-gray-300 dark:border-gray-700"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
