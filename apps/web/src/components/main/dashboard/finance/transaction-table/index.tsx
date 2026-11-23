"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader as TableHead,
  TableRow,
} from "@/components/ui/table";
import { BoxIcon } from "@/icons";
import { cn } from "@/utils";
import { RowSelectionState, useTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import { transactionsData } from "./data";
import TransactionRow from "./transaction-row";
import { Transaction, TransactionTableProps } from "./types";
import {
  createTransactionColumnFilters,
  createTransactionGlobalFilterFn,
  transactionTableColumns,
  transactionTableFeatures,
} from "./utils";

export type { TransactionTableProps };

export default function TransactionTable({
  data = transactionsData,
  className = "",
  statusFilter = "all",
  onDelete,
  onViewMore,
  onFilterClick,
}: TransactionTableProps) {
  const t = useTranslations("finance.transactionsTable");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleDelete = (transaction: Transaction) => {
    setDeletedIds((prev) => [...prev, transaction.id]);
    setRowSelection((prev) => {
      const next = { ...prev };
      delete next[transaction.id];
      return next;
    });
    onDelete?.(transaction);
  };

  const activeData = useMemo(
    () => data.filter((item) => !deletedIds.includes(item.id)),
    [data, deletedIds],
  );

  const globalFilterFn = useMemo(
    () => createTransactionGlobalFilterFn(t),
    [t],
  );

  const columnFilters = useMemo(
    () => createTransactionColumnFilters(statusFilter),
    [statusFilter],
  );

  const table = useTable({
    features: transactionTableFeatures,
    data: activeData,
    columns: transactionTableColumns,
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchQuery,
      columnFilters,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
  });

  const rows = table.getRowModel().rows;
  const isAllSelected = rows.length > 0 && table.getIsAllRowsSelected();
  const isSomeSelected =
    table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();

  const handleToggleAll = (checked: boolean | "indeterminate") => {
    table.toggleAllRowsSelected(Boolean(checked));
  };

  return (
    <Card
      className={cn(
        "w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Table Header Controls */}
      <CardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={onFilterClick}
      />

      {/* Table Content */}
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHead className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-11 min-w-44 py-3 ps-6 pe-4 text-start whitespace-nowrap"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onCheckedChange={handleToggleAll}
                      aria-label={t("table.orderId")}
                    />
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {t("table.orderId")}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-48 px-6 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-500 dark:text-gray-400"
                >
                  {t("table.activity")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-36 px-6 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-500 dark:text-gray-400"
                >
                  {t("table.price")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-52 px-6 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-500 dark:text-gray-400"
                >
                  {t("table.date")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-6 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-500 dark:text-gray-400"
                >
                  {t("table.status")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-16 py-3 pe-6 ps-4 text-end whitespace-nowrap"
                />
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TransactionRow
                    key={row.id}
                    transaction={row.original}
                    isSelected={row.getIsSelected()}
                    onToggleSelect={() => row.toggleSelected()}
                    onViewMore={onViewMore}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <BoxIcon className="size-6 text-gray-800 dark:text-white/90" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        No transactions found
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search criteria.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
