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

export interface ProductListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductListPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ProductListPaginationProps) {
  if (totalPages <= 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to generate pages to display with ellipsis
  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        2,
        3,
        "ellipsis",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  };

  const pages = getPages();

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="text-gray-800 dark:text-white/90">
          {startItem} to {endItem}
        </span>{" "}
        of{" "}
        <span className="text-gray-800 dark:text-white/90">{totalItems}</span>
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationPrevious
              size="icon"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className="size-10 rounded-lg border-gray-300 dark:border-gray-700"
            />
          </PaginationItem>

          {pages.map((item, index) => {
            if (typeof item === "string") {
              return (
                <PaginationItem key={`${item}-${index}`}>
                  <PaginationEllipsis className="size-10" />
                </PaginationItem>
              );
            }

            const pageNum = item;
            const isActive = pageNum === currentPage;

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={isActive}
                  variant={isActive ? "default" : "outline"}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNum);
                  }}
                  className={`size-10 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              size="icon"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className="size-10 rounded-lg border-gray-300 dark:border-gray-700"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
