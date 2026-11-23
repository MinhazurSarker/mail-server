"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";

export interface CardFooterProps {
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  startRow?: number;
  endRow?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export default function CardFooter({
  currentPage = 1,
  totalPages = 10,
  totalCount = 114,
  startRow = 0,
  endRow = 10,
  onPageChange,
  className = "",
}: CardFooterProps) {
  const t = useTranslations("logistics.deliveriesActivity");

  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = getVisiblePages();

  return (
    <div
      className={`flex flex-col gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 ${className}`}
    >
      {/* Showing X to Y of Z */}
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {t("pagination.showing")}{" "}
        <span className="text-gray-800 dark:text-white/90">
          {totalCount === 0 ? 0 : startRow + 1}
        </span>{" "}
        {t("pagination.to")}{" "}
        <span className="text-gray-800 dark:text-white/90">
          {Math.min(endRow, totalCount)}
        </span>{" "}
        {t("pagination.of")}{" "}
        <span className="text-gray-800 dark:text-white/90">{totalCount}</span>
      </div>

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
              />
            </PaginationItem>

            {pages.map((p, index) => {
              if (p === "...") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis className="size-10 rounded-[10px] border border-gray-300 bg-white font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      ...
                    </PaginationEllipsis>
                  </PaginationItem>
                );
              }

              const pageNum = Number(p);
              const isActive = currentPage === pageNum;

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    size="icon"
                    variant="outline"
                    isActive={isActive}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange?.(pageNum);
                    }}
                  >
                    {pageNum}
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
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
