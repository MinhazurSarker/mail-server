"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BoxIcon } from "@/icons";
import { cn } from "@/utils";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  PaginationState,
  Row,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import ColumnHeader from "./column-header";
import { tableOneData } from "./data";
import EmployeeRow from "./employee-row";
import { Employee, TableOneProps } from "./types";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

const columnHelper = createColumnHelper<typeof features, Employee>();

export default function TableOne({
  data = tableOneData,
  className,
}: TableOneProps = {}) {
  const [employees] = useState<Employee[]>(data);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((row: Employee) => row.user.name, {
          id: "user",
          header: "User",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("position", {
          id: "position",
          header: "Position",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("office", {
          id: "office",
          header: "Office",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("age", {
          id: "age",
          header: "Age",
          sortFn: "basic",
        }),
        columnHelper.accessor("startDate", {
          id: "startDate",
          header: "Start date",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("salary", {
          id: "salary",
          header: "Salary",
          sortFn: (rowA, rowB, columnId) => {
            const numA = Number(
              String(rowA.getValue(columnId)).replace(/[^0-9.-]+/g, ""),
            );
            const numB = Number(
              String(rowB.getValue(columnId)).replace(/[^0-9.-]+/g, ""),
            );
            return numA - numB;
          },
        }),
      ]),
    [],
  );

  const table = useTable({
    features,
    data: employees,
    columns,
    getRowId: (row: Employee) => String(row.id),
    state: {
      globalFilter: searchQuery,
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn: (
      row: Row<typeof features, Employee>,
      _columnId: string,
      filterValue: unknown,
    ) => {
      const query = String(filterValue ?? "").trim().toLowerCase();
      if (!query) return true;
      const { user, position, office, age, startDate, salary } = row.original;
      return (
        user.name.toLowerCase().includes(query) ||
        position.toLowerCase().includes(query) ||
        office.toLowerCase().includes(query) ||
        String(age).includes(query) ||
        startDate.toLowerCase().includes(query) ||
        salary.toLowerCase().includes(query)
      );
    },
  });

  const rows = table.getRowModel().rows;
  const totalEntries = table.getRowCount();
  const totalPages = table.getPageCount();

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
      pageSize: newPageSize,
    }));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const handlePageChange = (newPageIndex: number) => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: newPageIndex,
    }));
  };

  return (
    <Card
      className={cn(
        "w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Table Top Controls */}
      <CardHeader
        pageSize={pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Table Content */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-175 2xl:min-w-202">
          <Table>
            <TableHeader className="border-y border-gray-200 bg-gray-50/75 dark:border-gray-800 dark:bg-gray-900/50">
              <TableRow>
                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <ColumnHeader
                    title="User"
                    isSorted={table.getColumn("user")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("user")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <ColumnHeader
                    title="Position"
                    isSorted={
                      table.getColumn("position")?.getIsSorted() ?? false
                    }
                    onToggleSorting={table
                      .getColumn("position")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <ColumnHeader
                    title="Office"
                    isSorted={table.getColumn("office")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("office")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <ColumnHeader
                    title="Age"
                    isSorted={table.getColumn("age")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("age")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <ColumnHeader
                    title="Start date"
                    isSorted={
                      table.getColumn("startDate")?.getIsSorted() ?? false
                    }
                    onToggleSorting={table
                      .getColumn("startDate")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="px-4 py-3 sm:px-6">
                  <ColumnHeader
                    title="Salary"
                    isSorted={table.getColumn("salary")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("salary")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <EmployeeRow key={row.original.id} employee={row.original} />
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
                        No entries found
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search to find what you&apos;re looking
                        for.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Table Footer Pagination */}
      <CardFooter
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalEntries={totalEntries}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}
