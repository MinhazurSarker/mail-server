"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import { transactionsData } from "./data";
import TransactionRow from "./transaction-row";
import { Transaction } from "./types";

export interface TransactionsTableProps {
  data?: Transaction[];
  className?: string;
  itemsPerPage?: number;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionsTable({
  data = transactionsData,
  className = "",
  itemsPerPage = 5,
  onDelete,
}: TransactionsTableProps) {
  const t = useTranslations("aiDashboard.recentTransactions");
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = (transaction: Transaction) => {
    setDeletedIds((prev) => [...prev, transaction.id]);
    onDelete?.(transaction);
  };

  const filteredData = useMemo(() => {
    const activeData = data.filter((item) => !deletedIds.includes(item.id));
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeData;
    return activeData.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query),
    );
  }, [data, deletedIds, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, safeCurrentPage, itemsPerPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
        onSearchChange={handleSearchChange}
      />

      {/* Table Content */}
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHead className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-11 min-w-44 py-3 ps-5 text-start text-sm font-normal text-gray-500 sm:ps-6 dark:text-gray-400"
                >
                  {t("table.paidBy")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-44 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.packageName")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.price")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-36 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.paidDate")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-28 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.status")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-16 py-3 pe-5 text-end text-sm font-normal text-gray-500 sm:pe-6 dark:text-gray-400"
                >
                  {t("table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
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
                        {t("noTransactions")}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("noTransactionsDescription")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Table Footer - Pagination */}
      <CardFooter
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}
