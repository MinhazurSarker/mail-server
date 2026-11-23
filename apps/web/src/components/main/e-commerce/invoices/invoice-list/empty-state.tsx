"use client";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FileIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceEmptyStateProps } from "./types";

export default function InvoiceEmptyState({
  hasFiltersActive,
  onClearFilters,
  className,
}: InvoiceEmptyStateProps) {
  return (
    <TableRow className={className}>
      <TableCell
        colSpan={7}
        className="py-14 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <FileIcon className="size-6 text-gray-700 dark:text-gray-300" />
          </div>
          <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
            No invoices found
          </h4>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {hasFiltersActive
              ? "We couldn't find any invoices matching your search or filter criteria."
              : "There are no invoices available at this moment."}
          </p>
          {hasFiltersActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="mt-4 h-9 rounded-lg border-gray-300 px-3.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
