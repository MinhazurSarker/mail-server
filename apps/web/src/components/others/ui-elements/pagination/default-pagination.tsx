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
import { useState } from "react";

interface PaginationProps {
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function DefaultPagination({
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

    if (currentPage <= 2) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage === 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 1) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    if (currentPage === totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
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
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            disabled={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

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

        <PaginationItem>
          <PaginationNext
            href="#"
            disabled={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default DefaultPagination;
