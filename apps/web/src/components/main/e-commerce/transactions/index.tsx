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
import { AngleDownIcon, AngleUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import { initialTransactionsData } from "./data";
import TransactionRow from "./transaction-row";
import {
  SortDirection,
  TransactionSortField,
  TransactionTableProps,
} from "./types";

export default function TransactionsTable({
  initialData = initialTransactionsData,
  itemsPerPage = 10,
  className,
  onExportCsv,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState("7-days");
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set(),
  );
  const [sortField, setSortField] = useState<TransactionSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return initialData;
    const query = searchQuery.toLowerCase();
    return initialData.filter(
      (item) =>
        item.orderId.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.totalAmount.toLowerCase().includes(query) ||
        item.dueDate.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query),
    );
  }, [initialData, searchQuery]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      let comparison = 0;
      if (sortField === "totalAmount") {
        const numA = parseFloat(aVal.replace(/[^0-9.-]+/g, "")) || 0;
        const numB = parseFloat(bVal.replace(/[^0-9.-]+/g, "")) || 0;
        comparison = numA - numB;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Total items and pagination calculation
  const totalItems =
    filteredData.length === 0 ? 0 : Math.max(filteredData.length, 1000);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    if (sortedData.length === 0) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

    // If navigating to higher pages than sample data contains, replicate sample data with offset IDs
    if (pageItems.length === 0 && sortedData.length > 0) {
      return sortedData.slice(0, itemsPerPage).map((item, idx) => ({
        ...item,
        id: startIndex + idx + 1,
      }));
    }
    return pageItems;
  }, [sortedData, currentPage, itemsPerPage]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map((item) => item.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: number | string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(item.id));

  // Sort toggle handler
  const handleSort = (field: TransactionSortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIndicator = (field: TransactionSortField) => {
    const isAsc = sortField === field && sortDirection === "asc";
    const isDesc = sortField === field && sortDirection === "desc";

    return (
      <span className="inline-flex flex-col gap-0.5" aria-hidden="true">
        <AngleUpIcon
          className={cn(
            "size-2 transition-colors",
            isAsc
              ? "text-gray-800 dark:text-white"
              : "text-gray-400 dark:text-gray-600",
          )}
        />
        <AngleDownIcon
          className={cn(
            "size-2 transition-colors",
            isDesc
              ? "text-gray-800 dark:text-white"
              : "text-gray-400 dark:text-gray-600",
          )}
        />
      </span>
    );
  };

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
    } else {
      console.log("Exporting CSV transactions...");
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Card Header with Title, Description, Search, Filter & Export */}
      <CardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        onExportCsv={handleExportCsv}
      />

      {/* Table Content with horizontal ScrollArea */}
      <CardContent className="p-0">
        <ScrollArea scrollbars="horizontal" className="w-full">
          <Table>
            <TableHead className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                {/* Order ID with Select All Checkbox */}
                <TableCell
                  isHeader
                  className="h-11 min-w-36 py-3 ps-5 text-start text-xs font-medium text-gray-500 sm:ps-6 dark:text-gray-400"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleSelectAll(Boolean(checked))
                      }
                      aria-label="Select all transactions"
                    />
                    <span>Order ID</span>
                  </div>
                </TableCell>

                {/* Customer Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-44 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("customer")}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-colors hover:text-gray-800 dark:hover:text-white"
                  >
                    <span>Customer</span>
                    {renderSortIndicator("customer")}
                  </button>
                </TableCell>

                {/* Email Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-56 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("email")}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-colors hover:text-gray-800 dark:hover:text-white"
                  >
                    <span>Email</span>
                    {renderSortIndicator("email")}
                  </button>
                </TableCell>

                {/* Total Amount Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("totalAmount")}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-colors hover:text-gray-800 dark:hover:text-white"
                  >
                    <span>Total Amount</span>
                    {renderSortIndicator("totalAmount")}
                  </button>
                </TableCell>

                {/* Due Date Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-36 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("dueDate")}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-colors hover:text-gray-800 dark:hover:text-white"
                  >
                    <span>Due Date</span>
                    {renderSortIndicator("dueDate")}
                  </button>
                </TableCell>

                {/* Status Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-28 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>

                {/* Actions Column */}
                <TableCell
                  isHeader
                  className="h-11 min-w-20 py-3 pe-5 text-end text-xs font-medium text-gray-500 sm:pe-6 dark:text-gray-400"
                >
                  <span className="sr-only">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    isSelected={selectedIds.has(transaction.id)}
                    onSelect={handleSelectRow}
                    onView={onViewTransaction}
                    onEdit={onEditTransaction}
                    onDelete={onDeleteTransaction}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    No Content
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Card Footer - Responsive Pagination */}
      <CardFooter
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}
