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
import { HorizontalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { Transaction } from "./types";

export interface TransactionRowProps {
  transaction: Transaction;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onViewMore?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionRow({
  transaction,
  isSelected = false,
  onToggleSelect,
  onViewMore,
  onDelete,
}: TransactionRowProps) {
  const t = useTranslations("finance.transactionsTable");
  const tCommon = useTranslations("common");

  return (
    <TableRow className="h-18 border-b border-gray-100 dark:border-gray-800">
      <TableCell className="py-4 ps-6 pe-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(transaction.id)}
            aria-label={transaction.orderId}
          />
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {transaction.orderId}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
        {t(`activities.${transaction.activityKey}`)}
      </TableCell>
      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
        {transaction.price}
      </TableCell>
      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
        {transaction.date}
      </TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant="light"
          color={transaction.statusKey === "completed" ? "success" : "warning"}
          size="sm"
        >
          {t(`statuses.${transaction.statusKey}`)}
        </Badge>
      </TableCell>
      <TableCell className="py-4 ps-4 pe-6 text-end whitespace-nowrap">
        <div className="inline-flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Actions"
                />
              }
            >
              <HorizontalDotsIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 min-w-36 p-1">
              <DropdownMenuItem onClick={() => onViewMore?.(transaction)}>
                {tCommon("viewMore")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(transaction)}
              >
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
