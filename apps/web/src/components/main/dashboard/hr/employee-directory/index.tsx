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
import { PaginationState, useTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import { employeesData } from "./data";
import EmployeeRow from "./employee-row";
import {
  Employee,
  EmployeeDepartmentKey,
  EmployeeDirectoryProps,
  EmployeeStatusKey,
} from "./types";
import {
  createEmployeeDirectoryColumnFilters,
  createEmployeeDirectoryGlobalFilterFn,
  employeeDirectoryColumns,
  employeeDirectoryTableFeatures,
} from "./utils";

export default function EmployeeDirectory({
  data = employeesData,
  className = "",
  itemsPerPage = 5,
  onDelete,
  onViewMore,
}: EmployeeDirectoryProps) {
  const t = useTranslations("hr.employeeDirectory");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<EmployeeDepartmentKey>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    EmployeeStatusKey | "all"
  >("all");
  const [pageIndex, setPageIndex] = useState(0);

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex,
      pageSize: itemsPerPage,
    }),
    [pageIndex, itemsPerPage],
  );

  const handleDelete = (employee: Employee) => {
    setDeletedIds((prev) => [...prev, employee.id]);
    onDelete?.(employee);
  };

  const activeData = useMemo(
    () => data.filter((item) => !deletedIds.includes(item.id)),
    [data, deletedIds],
  );

  const columnFilters = useMemo(
    () =>
      createEmployeeDirectoryColumnFilters(
        selectedDepartment,
        selectedStatus,
      ),
    [selectedDepartment, selectedStatus],
  );

  const globalFilterFn = useMemo(
    () => createEmployeeDirectoryGlobalFilterFn(t),
    [t],
  );

  const table = useTable({
    features: employeeDirectoryTableFeatures,
    data: activeData,
    columns: employeeDirectoryColumns,
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchQuery,
      columnFilters,
      pagination,
    },
    onPaginationChange: (updaterOrValue) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      setPageIndex(next.pageIndex);
    },
    globalFilterFn,
  });

  const rows = table.getRowModel().rows;
  const totalPages = Math.max(1, table.getPageCount());
  const currentPage = pageIndex + 1;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPageIndex(0);
  };

  const handleDepartmentChange = (dept: EmployeeDepartmentKey) => {
    setSelectedDepartment(dept);
    setPageIndex(0);
  };

  const handleStatusChange = (status: EmployeeStatusKey | "all") => {
    setSelectedStatus(status);
    setPageIndex(0);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(Math.max(0, page - 1));
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
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Table Content */}
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <Table>
            <TableHead className="border-y border-gray-100 bg-transparent dark:border-gray-800">
              <TableRow className="h-11 border-b border-gray-100 dark:border-gray-800">
                <TableCell
                  isHeader
                  className="h-11 min-w-56 py-3 ps-6 pe-4 text-start whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.users")}
                  </span>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-40 px-6 py-3 text-start whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.department")}
                  </span>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-44 px-6 py-3 text-start whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.role")}
                  </span>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-6 py-3 text-start whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.status")}
                  </span>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-40 px-6 py-3 text-start whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.joined")}
                  </span>
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-16 py-3 ps-4 pe-6 text-end whitespace-nowrap"
                >
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    {t("table.action")}
                  </span>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <EmployeeRow
                    key={row.original.id}
                    employee={row.original}
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
                        {t("noEmployeesTitle")}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {t("noEmployees")}
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
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}
