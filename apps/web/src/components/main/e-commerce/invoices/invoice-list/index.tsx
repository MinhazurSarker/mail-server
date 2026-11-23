"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import {
  PaginationState,
  RowSelectionState,
  SortingState,
  useTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import CardFooter from "./card-footer";
import CardHeader from "./card-header";
import { extendedInvoicesData } from "./data";
import InvoiceTable from "./invoice-table";
import {
  Invoice,
  InvoiceSortField,
  InvoiceStatusFilter,
  InvoiceTableProps,
  SortDirection,
} from "./types";
import {
  createInvoiceColumnFilters,
  invoiceGlobalFilterFn,
  invoiceTableColumns,
  invoiceTableFeatures,
} from "./utils";

export default function InvoiceList({
  initialData = extendedInvoicesData,
  itemsPerPage = 10,
  className,
  onExport,
  onFilter,
  onViewInvoice,
  onDownloadInvoice,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const [data, setData] = useState<Invoice[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: itemsPerPage,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columnFilters = useMemo(
    () => createInvoiceColumnFilters(statusFilter),
    [statusFilter],
  );

  const table = useTable({
    features: invoiceTableFeatures,
    data,
    columns: invoiceTableColumns,
    getRowId: (row) => row.id,
    state: {
      globalFilter: searchTerm,
      columnFilters,
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: invoiceGlobalFilterFn,
  });

  const rows = table.getRowModel().rows;
  const paginatedData = useMemo(
    () => rows.map((row) => row.original),
    [rows],
  );
  const totalItems = table.getRowCount();
  const totalPages = Math.max(1, table.getPageCount());
  const currentPage = pagination.pageIndex + 1;

  const currentSort = sorting[0];
  const sortField = (currentSort?.id as InvoiceSortField) || null;
  const sortDirection: SortDirection = currentSort?.desc ? "desc" : "asc";

  const isAllCurrentPageSelected =
    rows.length > 0 && table.getIsAllPageRowsSelected();

  const selectedIds = useMemo(
    () => new Set(Object.keys(rowSelection).filter((id) => rowSelection[id])),
    [rowSelection],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (filter: InvoiceStatusFilter) => {
    setStatusFilter(filter);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  };

  const handleSort = (field: InvoiceSortField) => {
    setSorting((prev) => {
      const current = prev.find((s) => s.id === field);
      if (!current) {
        return [{ id: field, desc: false }];
      }
      if (!current.desc) {
        return [{ id: field, desc: true }];
      }
      return [];
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    table.toggleAllPageRowsSelected(checked);
  };

  const handleToggleSelectRow = (id: string, checked: boolean) => {
    table.getRow(id)?.toggleSelected(checked);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log("Exporting invoices list...");
    }
  };

  const handleFilter = () => {
    if (onFilter) {
      onFilter();
    } else {
      console.log("Filter button clicked...");
    }
  };

  const handleView = (invoice: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(invoice);
    } else {
      console.log(`Viewing details for invoice ${invoice.invoiceNumber}`);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (onDownloadInvoice) {
      onDownloadInvoice(invoice);
    } else {
      console.log(`Downloading invoice ${invoice.invoiceNumber}`);
    }
  };

  const handleDelete = (invoice: Invoice) => {
    if (onDeleteInvoice) {
      onDeleteInvoice(invoice);
    } else {
      setData((prev) => prev.filter((item) => item.id !== invoice.id));
      setRowSelection((prev) => {
        const next = { ...prev };
        delete next[invoice.id];
        return next;
      });
    }
  };

  const hasFiltersActive = Boolean(
    searchTerm.trim() !== "" || statusFilter !== "all",
  );

  return (
    <Card
      className={cn(
        "w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Card Header with Title, Search, Status Tabs, Filter, and Export */}
      <CardHeader
        title="Invoices"
        description="Your most recent invoices list"
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onFilter={handleFilter}
        onExport={handleExport}
      />

      {/* Table Content with horizontal ScrollArea */}
      <InvoiceTable
        invoices={paginatedData}
        selectedIds={selectedIds}
        isAllSelected={isAllCurrentPageSelected}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectRow={handleToggleSelectRow}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        hasFiltersActive={hasFiltersActive}
        onClearFilters={handleClearFilters}
        onViewInvoice={handleView}
        onDownloadInvoice={handleDownload}
        onDeleteInvoice={handleDelete}
      />

      {/* Footer with entry count and pagination */}
      <CardFooter
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </Card>
  );
}

