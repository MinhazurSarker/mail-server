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
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { useState } from "react";

interface PaginationProps {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function PaginationWithIcon({
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
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
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
      <PaginationContent className="flex-wrap gap-1 sm:gap-1.5">
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
            <ArrowLeftIcon className="rtl:rotate-180" />
          </PaginationPrevious>
        </PaginationItem>

        <div className="flex items-center gap-1 ms-1 me-1 sm:ms-3 sm:me-3">
          {pages.map((page, index) => {
            if (page === "...") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
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
        </div>

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
            <ArrowRightIcon className="rtl:rotate-180" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationWithIcon;
