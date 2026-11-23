"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { TableCell, TableRow } from "@/components/ui/table";
import { TrashBinIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { Transaction } from "./types";

export interface TransactionRowProps {
  transaction: Transaction;
  onViewMore?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionRow({
  transaction,
  onDelete,
}: TransactionRowProps) {
  const t = useTranslations("aiDashboard.recentTransactions");
  const tCommon = useTranslations("common");

  const handleDelete = () => {
    onDelete?.(transaction);
  };

  return (
    <TableRow className="h-16 border-b border-gray-100 dark:border-gray-800">
      <TableCell className="min-w-44 py-3 ps-5 sm:ps-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="block text-sm font-medium text-gray-800 dark:text-white/90">
              {transaction.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {transaction.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="min-w-44 px-4 py-3 text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
        {t(`packages.${transaction.packageKey}`)}
      </TableCell>
      <TableCell className="min-w-32 px-4 py-3 text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
        {transaction.price}
      </TableCell>
      <TableCell className="min-w-36 px-4 py-3 text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
        {transaction.paidDate}
      </TableCell>
      <TableCell className="min-w-28 px-4 py-3 text-sm whitespace-nowrap">
        <Badge
          color={transaction.statusKey === "active" ? "success" : "error"}
          size="sm"
        >
          {t(`statuses.${transaction.statusKey}`)}
        </Badge>
      </TableCell>
      <TableCell className="min-w-16 py-3 pe-5 text-end whitespace-nowrap sm:pe-6">
        <div className="inline-flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                  aria-label={tCommon("delete")}
                />
              }
            >
              <TrashBinIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 min-w-32 p-1">
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                {tCommon("confirm")}
              </DropdownMenuItem>
              <DropdownMenuItem>{tCommon("cancel")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
