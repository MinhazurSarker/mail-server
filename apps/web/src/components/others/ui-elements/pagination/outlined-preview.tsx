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
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { useState } from "react";

interface PaginationProps {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function OutlinedPagination({
  totalPages = 10,
  initialPage = 1,
  onPageChange,
}: PaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const getPages = () => {
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

  const pages = getPages();

  return (
    <Pagination>
      <PaginationContent className="gap-1.5">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            size="icon"
            variant="outline"
            disabled={currentPage === 1}
            aria-label="Previous"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          >
            <ChevronLeftIcon className="rtl:rotate-180" />
          </PaginationPrevious>
        </PaginationItem>

        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="size-10 rounded-[10px] border border-gray-300 bg-white font-medium text-gray-700 shadow-theme-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  ...
                </PaginationEllipsis>
              </PaginationItem>
            );
          }

          const pageNumber = Number(page);
          const isActive = currentPage === pageNumber;

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={isActive}
                variant={isActive ? "default" : "outline"}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            size="icon"
            variant="outline"
            disabled={currentPage === totalPages}
            aria-label="Next"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          >
            <ChevronRightIcon className="rtl:rotate-180" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default OutlinedPagination;
