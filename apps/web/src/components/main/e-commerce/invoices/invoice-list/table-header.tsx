"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  TableCell,
  TableHeader as TableHead,
  TableRow,
} from "@/components/ui/table";
import { AngleDownIcon, AngleUpIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceSortField, InvoiceTableHeaderProps } from "./types";

export default function InvoiceTableHeader({
  isAllSelected,
  onToggleSelectAll,
  sortField,
  sortDirection,
  onSort,
  className,
}: InvoiceTableHeaderProps) {
  const renderSortIcon = (field: InvoiceSortField) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const isDesc = sortField === field && sortDirection === "desc";

    return (
      <span className="flex flex-col gap-0.5" aria-hidden="true">
        <AngleUpIcon
          className={cn(
            "transition-colors",
            isAsc
              ? "text-[#6A7282] dark:text-white"
              : "text-[#D1D5DC] dark:text-gray-600",
          )}
        />
        <AngleDownIcon
          className={cn(
            "transition-colors",
            isDesc
              ? "text-[#6A7282] dark:text-white"
              : "text-[#D1D5DC] dark:text-gray-600",
          )}
        />
      </span>
    );
  };

  return (
    <TableHead
      className={cn("border-y border-gray-100 dark:border-gray-800", className)}
    >
      <TableRow>
        {/* Checkbox + Invoice Number Header */}
        <TableCell
          isHeader
          className="h-11 min-w-44 py-2 ps-5 text-start text-xs font-medium text-gray-500 sm:ps-6 dark:text-gray-400"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => onToggleSelectAll(Boolean(checked))}
              aria-label="Select all invoices on current page"
            />
            <span>Invoice Number</span>
          </div>
        </TableCell>

        {/* Customer Header */}
        <TableCell
          isHeader
          className="h-11 min-w-44 px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <button
            type="button"
            onClick={() => onSort("customer")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-800 dark:hover:text-white"
          >
            <span>Customer</span>
            {renderSortIcon("customer")}
          </button>
        </TableCell>

        {/* Created Date Header */}
        <TableCell
          isHeader
          className="h-11 min-w-36 px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <button
            type="button"
            onClick={() => onSort("createdDate")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-800 dark:hover:text-white"
          >
            <span>Created Date</span>
            {renderSortIcon("createdDate")}
          </button>
        </TableCell>

        {/* Due Date Header */}
        <TableCell
          isHeader
          className="h-11 min-w-36 px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          <button
            type="button"
            onClick={() => onSort("dueDate")}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-800 dark:hover:text-white"
          >
            <span>Due Date</span>
            {renderSortIcon("dueDate")}
          </button>
        </TableCell>

        {/* Total Header */}
        <TableCell
          isHeader
          className="h-11 min-w-28 px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Total
        </TableCell>

        {/* Status Header */}
        <TableCell
          isHeader
          className="h-11 min-w-28 px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Status
        </TableCell>

        {/* Action Header */}
        <TableCell
          isHeader
          className="h-11 w-16 py-2 pe-5 text-end text-xs font-medium text-gray-500 sm:pe-6 dark:text-gray-400"
        >
          <span className="sr-only">Actions</span>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
