"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { TableCell, TableRow } from "@/components/ui/table";
import { DownloadIcon, EyeIcon, HorizontalDotsIcon, TrashBinIcon } from "@/icons";
import { cn } from "@/utils";
import { TransactionRowProps, TransactionStatus } from "./types";

export default function TransactionRow({
  transaction,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  className,
}: TransactionRowProps) {
  const getBadgeColor = (status: TransactionStatus) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      default:
        return "primary";
    }
  };

  return (
    <TableRow
      className={cn(
        "h-15 transition-colors",
        isSelected && "bg-gray-50/50 dark:bg-white/2",
        className,
      )}
    >
      {/* Checkbox + Order ID */}
      <TableCell className="min-w-36 py-3 ps-5 sm:ps-6">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect?.(transaction.id, Boolean(checked))
            }
          />
          <span className="text-sm font-normal text-gray-800 dark:text-white/90">
            {transaction.orderId}
          </span>
        </div>
      </TableCell>

      {/* Customer Name */}
      <TableCell className="min-w-44 px-4 py-3 text-start text-sm font-medium text-gray-800 dark:text-white/90">
        {transaction.customer}
      </TableCell>

      {/* Customer Email */}
      <TableCell className="min-w-56 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400">
        {transaction.email}
      </TableCell>

      {/* Total Amount */}
      <TableCell className="min-w-32 px-4 py-3 text-start text-sm font-normal text-gray-800 dark:text-white/90">
        {transaction.totalAmount}
      </TableCell>

      {/* Due Date */}
      <TableCell className="min-w-36 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400">
        {transaction.dueDate}
      </TableCell>

      {/* Status */}
      <TableCell className="min-w-28 px-4 py-3 text-start">
        <Badge
          variant="light"
          color={getBadgeColor(transaction.status)}
          size="sm"
        >
          {transaction.status}
        </Badge>
      </TableCell>

      {/* Action (HorizontalDots Menu) */}
      <TableCell className="min-w-20 py-3 pe-5 text-end sm:pe-6">
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for transaction ${transaction.orderId}`}
                  className="size-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
                >
                  <HorizontalDotsIcon className="size-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView?.(transaction)}>
                <EyeIcon className="size-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(transaction)}>
                <DownloadIcon className="size-4" />
                <span>Download Receipt</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(transaction)}
              >
                <TrashBinIcon className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
