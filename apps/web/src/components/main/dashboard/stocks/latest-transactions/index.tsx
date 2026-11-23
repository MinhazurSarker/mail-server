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
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { latestTransactionsData } from "./data";
import TableFooter from "./table-footer";
import TableHeader from "./table-header";
import TransactionRow from "./transaction-row";

export default function LatestTransactions() {
  const t = useTranslations("stocks.latestTransactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return latestTransactionsData.slice(0, 5);
    return latestTransactionsData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    <Card className="w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3">
      {/* Table Header Controls */}
      <TableHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

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
                  {t("table.name")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-44 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.date")}
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
                  {t("table.category")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-28 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  {t("table.status")}
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-16 py-3 pe-5 sm:pe-6"
                />
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredData.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Table Footer - Pagination */}
      <TableFooter
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}
