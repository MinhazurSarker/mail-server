"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { TableCell, TableRow } from "@/components/ui/table";
import { HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceRowProps, InvoiceStatus } from "./types";

export default function InvoiceRow({
  invoice,
  isSelected = false,
  onToggleSelect,
  onView,
  onDownload,
  onDelete,
  className,
}: InvoiceRowProps) {
  const getBadgeProps = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return {
          color: "success" as const,
          className:
            "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
        };
      case "Overdue":
        return {
          color: "error" as const,
          className:
            "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
        };
      case "Pending":
        return {
          color: "warning" as const,
          className:
            "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
        };
      case "Draft":
        return {
          color: "light" as const,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const badgeProps = getBadgeProps(invoice.status);

  return (
    <TableRow
      className={cn(
        "h-15 border-b border-gray-100 transition-colors hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-white/2",
        isSelected && "bg-gray-50/80 dark:bg-white/3",
        className,
      )}
    >
      {/* Invoice Number with Checkbox */}
      <TableCell className="min-w-44 py-3 ps-5 sm:ps-6">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onToggleSelect?.(Boolean(checked))}
            aria-label={`Select invoice ${invoice.invoiceNumber}`}
          />
          <button
            type="button"
            onClick={() => onView?.(invoice)}
            className="text-sm font-normal text-gray-700 hover:text-gray-900 hover:underline dark:text-gray-300 dark:hover:text-white"
          >
            {invoice.invoiceNumber}
          </button>
        </div>
      </TableCell>

      {/* Customer */}
      <TableCell className="min-w-44 px-4 py-3 text-start whitespace-nowrap">
        <span className="text-sm font-normal text-gray-800 dark:text-white/90">
          {invoice.customer}
        </span>
      </TableCell>

      {/* Created Date */}
      <TableCell className="min-w-36 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {invoice.createdDate}
      </TableCell>

      {/* Due Date */}
      <TableCell className="min-w-36 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {invoice.dueDate}
      </TableCell>

      {/* Total */}
      <TableCell className="min-w-28 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-300">
        {invoice.total}
      </TableCell>

      {/* Status */}
      <TableCell className="min-w-28 px-4 py-3 text-start whitespace-nowrap">
        <Badge
          variant="light"
          color={badgeProps.color}
          size="sm"
          className={badgeProps.className}
        >
          {invoice.status}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell className="w-16 py-3 pe-5 text-end whitespace-nowrap sm:pe-6">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-8 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
              />
            }
          >
            <HorizontalDotsIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onView?.(invoice)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload?.(invoice)}>
              Download Invoice
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete?.(invoice)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
