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
  RowSelectionState,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CandidateRow from "./candidate-row";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import ColumnHeader from "./column-header";
import { tableThreeData } from "./data";
import { Candidate, TableThreeProps } from "./types";

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns,
});

const columnHelper = createColumnHelper<typeof features, Candidate>();

export default function TableThree({
  data = tableThreeData,
  className,
  onDownload,
  onDelete,
  onEdit,
}: TableThreeProps = {}) {
  const [candidates, setCandidates] = useState<Candidate[]>(data);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({
    "3": true,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((row: Candidate) => row.user.name, {
          id: "user",
          header: "User",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("position", {
          id: "position",
          header: "Position",
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
        columnHelper.accessor("office", {
          id: "office",
          header: "Office",
          sortFn: "alphanumeric",
        }),
        columnHelper.accessor("status", {
          id: "status",
          header: "Status",
          sortFn: "alphanumeric",
        }),
        columnHelper.display({
          id: "action",
          header: "Action",
        }),
      ]),
    [],
  );

  const table = useTable({
    features,
    data: candidates,
    columns,
    getRowId: (row: Candidate) => String(row.id),
    state: {
      globalFilter: searchQuery,
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (
      row: Row<typeof features, Candidate>,
      _columnId: string,
      filterValue: unknown,
    ) => {
      const query = String(filterValue ?? "").trim().toLowerCase();
      if (!query) return true;
      const { user, position, salary, office, status } = row.original;
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        position.toLowerCase().includes(query) ||
        salary.toLowerCase().includes(query) ||
        office.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    },
  });

  const rows = table.getRowModel().rows;
  const totalEntries = table.getRowCount();
  const totalPages = table.getPageCount();

  const isAllPageSelected =
    rows.length > 0 &&
    rows.every((row) => !!rowSelection[String(row.original.id)]);

  const handleSelectAll = () => {
    if (isAllPageSelected) {
      setRowSelection((prev) => {
        const next = { ...prev };
        rows.forEach((row) => {
          delete next[String(row.original.id)];
        });
        return next;
      });
    } else {
      setRowSelection((prev) => {
        const next = { ...prev };
        rows.forEach((row) => {
          next[String(row.original.id)] = true;
        });
        return next;
      });
    }
  };

  const handleSelectRow = (id: string | number) => {
    setRowSelection((prev) => {
      const key = String(id);
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  };

  const handleDelete = (id: string | number) => {
    setCandidates((prev) => prev.filter((item) => item.id !== id));
    setRowSelection((prev) => {
      const key = String(id);
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onDelete?.(id);
  };

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

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const headers = ["User", "Email", "Position", "Salary", "Office", "Status"];
    const csvContent = [
      headers.join(","),
      ...candidates.map((c) =>
        [
          `"${c.user.name.replace(/"/g, '""')}"`,
          `"${c.user.email.replace(/"/g, '""')}"`,
          `"${c.position.replace(/"/g, '""')}"`,
          `"${c.salary.replace(/"/g, '""')}"`,
          `"${c.office.replace(/"/g, '""')}"`,
          `"${c.status.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "candidates_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        onDownload={handleDownload}
      />

      {/* Table Content */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-225">
          <Table>
            <TableHeader className="border-y border-gray-200 bg-gray-50/75 dark:border-gray-800 dark:bg-gray-900/50">
              <TableRow>
                <TableCell isHeader className="border-e border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isAllPageSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                    <ColumnHeader
                      title="User"
                      isSorted={table.getColumn("user")?.getIsSorted() ?? false}
                      onToggleSorting={table
                        .getColumn("user")
                        ?.getToggleSortingHandler()}
                    />
                  </div>
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
                    title="Salary"
                    isSorted={table.getColumn("salary")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("salary")
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
                    title="Status"
                    isSorted={table.getColumn("status")?.getIsSorted() ?? false}
                    onToggleSorting={table
                      .getColumn("status")
                      ?.getToggleSortingHandler()}
                  />
                </TableCell>

                <TableCell isHeader className="px-4 py-3 sm:px-6">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Action
                  </span>
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <CandidateRow
                    key={row.original.id}
                    candidate={row.original}
                    isSelected={!!rowSelection[String(row.original.id)]}
                    onSelect={handleSelectRow}
                    onDelete={handleDelete}
                    onEdit={onEdit}
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
