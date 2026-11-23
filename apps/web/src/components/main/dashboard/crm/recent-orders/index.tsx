"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoxIcon } from "@/icons";
import { RowSelectionState, useTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import { recentOrdersData } from "./data";
import OrderRow from "./order-row";
import { CrmOrder, DealStatus } from "./types";
import {
  createCrmRecentOrdersColumnFilters,
  crmRecentOrdersColumns,
  crmRecentOrdersGlobalFilterFn,
  crmRecentOrdersTableFeatures,
} from "./utils";

export default function RecentOrders() {
  const t = useTranslations("crm.recentOrders");

  const [orders, setOrders] = useState<CrmOrder[]>(recentOrdersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    "1": true,
  });

  const columnFilters = useMemo(
    () => createCrmRecentOrdersColumnFilters(statusFilter),
    [statusFilter],
  );

  const table = useTable({
    features: crmRecentOrdersTableFeatures,
    data: orders,
    columns: crmRecentOrdersColumns,
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchQuery,
      columnFilters,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    globalFilterFn: crmRecentOrdersGlobalFilterFn,
  });

  const rows = table.getRowModel().rows;
  const isAllSelected = rows.length > 0 && table.getIsAllRowsSelected();
  const isSomeSelected =
    table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    table.toggleAllRowsSelected(Boolean(checked));
  };

  const handleDelete = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    setRowSelection((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <Card className="w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3">
      {/* Table Header Controls */}
      <CardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Table Content */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-175 2xl:min-w-202">
          <Table>
            <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all orders"
                    />
                    <span>{t("dealId")}</span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("customer")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("productService")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("dealValue")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("closeDate")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("status")}
                </TableCell>

                <TableCell
                  isHeader
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {t("action")}
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="min-h-96 divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <OrderRow
                    key={row.id}
                    order={row.original}
                    isSelected={row.getIsSelected()}
                    onSelect={() => row.toggleSelected()}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <BoxIcon className="size-6 text-gray-800 dark:text-white/90" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {t("noOrders")}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("noOrdersDescription")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
