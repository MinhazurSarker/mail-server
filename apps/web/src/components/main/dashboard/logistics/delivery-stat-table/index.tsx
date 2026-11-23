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
import {
  PaginationState,
  RowSelectionState,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import { initialDeliveries } from "./data";
import DeliveryStatRow from "./delivery-stat-row";
import { DeliveryStatTableProps, DeliveryTab } from "./types";
import {
  createDeliveryColumnFilters,
  deliveryTableColumns,
  deliveryTableFeatures,
} from "./utils";

export default function DeliveryStatTable({
  data = initialDeliveries,
  className,
}: DeliveryStatTableProps = {}) {
  const t = useTranslations("logistics.deliveriesActivity");

  const [selectedTab, setSelectedTab] = useState<DeliveryTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columnFilters = useMemo(
    () =>
      createDeliveryColumnFilters(selectedTab, categoryFilter, companyFilter),
    [selectedTab, categoryFilter, companyFilter],
  );

  const table = useTable({
    features: deliveryTableFeatures,
    data,
    columns: deliveryTableColumns,
    getRowId: (row) => row.id,
    state: {
      columnFilters,
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
  });

  const rows = table.getRowModel().rows;
  const totalCount = table.getRowCount();
  const totalPages = Math.max(1, table.getPageCount());
  const currentPage = pagination.pageIndex + 1;
  const startRow =
    totalCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize;
  const endRow = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    totalCount,
  );

  const isAllCurrentSelected =
    rows.length > 0 && table.getIsAllPageRowsSelected();

  const handleTabChange = (tab: DeliveryTab) => {
    setSelectedTab(tab);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleCategoryFilterChange = (cat: string) => {
    setCategoryFilter(cat);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleCompanyFilterChange = (comp: string) => {
    setCompanyFilter(comp);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  };

  const handleToggleSelectAll = () => {
    table.toggleAllPageRowsSelected();
  };

  const handleToggleRowSelect = (id: string) => {
    table.getRow(id)?.toggleSelected();
  };

  const renderSortIcon = (columnId: string) => {
    const isSorted = table.getColumn(columnId)?.getIsSorted();
    const isAsc = isSorted === "asc";
    const isDesc = isSorted === "desc";

    return (
      <span className="flex flex-col gap-0.5" aria-hidden="true">
        <AngleUpIcon
          className={`size-2 transition-colors ${
            isAsc
              ? "text-gray-800 dark:text-white"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
        <AngleDownIcon
          className={`size-2 transition-colors ${
            isDesc
              ? "text-gray-800 dark:text-white"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      </span>
    );
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
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryFilterChange}
        companyFilter={companyFilter}
        onCompanyFilterChange={handleCompanyFilterChange}
      />

      {/* Table Content */}
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHead className="border-b border-gray-100 dark:border-gray-800">
              <TableRow className="h-11">
                {/* Checkbox + Order ID Header */}
                <TableCell
                  isHeader
                  className="h-11 min-w-40 py-3 ps-5 text-start sm:ps-6"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllCurrentSelected}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all orders on this page"
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("table.orderId")}
                    </span>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell
                  isHeader
                  onClick={table.getColumn("category")?.getToggleSortingHandler()}
                  className="h-11 min-w-36 cursor-pointer px-4 py-3 text-start select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("table.category")}
                    </span>
                    {renderSortIcon("category")}
                  </div>
                </TableCell>

                {/* Company */}
                <TableCell
                  isHeader
                  onClick={table.getColumn("company")?.getToggleSortingHandler()}
                  className="h-11 min-w-40 cursor-pointer px-4 py-3 text-start select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("table.company")}
                    </span>
                    {renderSortIcon("company")}
                  </div>
                </TableCell>

                {/* Arrival Time */}
                <TableCell
                  isHeader
                  onClick={table.getColumn("arrival")?.getToggleSortingHandler()}
                  className="h-11 min-w-48 cursor-pointer px-4 py-3 text-start select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("table.arrivalTime")}
                    </span>
                    {renderSortIcon("arrival")}
                  </div>
                </TableCell>

                {/* Route */}
                <TableCell
                  isHeader
                  className="h-11 min-w-48 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("table.route")}
                </TableCell>

                {/* Price */}
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("table.price")}
                </TableCell>

                {/* Status */}
                <TableCell
                  isHeader
                  className="h-11 min-w-32 py-3 pe-5 text-start text-xs font-medium text-gray-500 sm:pe-6 dark:text-gray-400"
                >
                  {t("table.status")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <DeliveryStatRow
                    key={row.original.id}
                    delivery={row.original}
                    isSelected={row.getIsSelected()}
                    onToggleSelect={handleToggleRowSelect}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No activities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Table Footer - Pagination */}
      <CardFooter
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        startRow={startRow}
        endRow={endRow}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}
