import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
import { Invoice, InvoiceStatus, InvoiceStatusFilter } from "./types";

export const invoiceTableFeatures = tableFeatures({
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

export const columnHelper = createColumnHelper<
  typeof invoiceTableFeatures,
  Invoice
>();

export const invoiceStatusFilterFn = (
  row: Row<typeof invoiceTableFeatures, Invoice>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  const filter = filterValue as InvoiceStatusFilter;
  if (!filter || filter === "all") return true;

  const status = row.getValue(columnId) as InvoiceStatus;
  if (filter === "unpaid") {
    return status === "Overdue" || status === "Pending";
  }
  if (filter === "draft") {
    return status === "Draft";
  }

  return true;
};

export const invoiceGlobalFilterFn = (
  row: Row<typeof invoiceTableFeatures, Invoice>,
  _columnId: string,
  filterValue: unknown,
): boolean => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;

  const { invoiceNumber, customer, createdDate, dueDate, total, status } =
    row.original;

  return (
    invoiceNumber.toLowerCase().includes(query) ||
    customer.toLowerCase().includes(query) ||
    createdDate.toLowerCase().includes(query) ||
    dueDate.toLowerCase().includes(query) ||
    total.toLowerCase().includes(query) ||
    status.toLowerCase().includes(query)
  );
};

export const invoiceDateSortFn = (
  rowA: Row<typeof invoiceTableFeatures, Invoice>,
  rowB: Row<typeof invoiceTableFeatures, Invoice>,
  columnId: string,
): number => {
  const timeA = new Date(rowA.getValue(columnId) as string).getTime() || 0;
  const timeB = new Date(rowB.getValue(columnId) as string).getTime() || 0;
  return timeA - timeB;
};

export const createInvoiceColumnFilters = (
  statusFilter: InvoiceStatusFilter,
): ColumnFiltersState => {
  const filters: ColumnFiltersState = [];

  if (statusFilter !== "all") {
    filters.push({ id: "status", value: statusFilter });
  }

  return filters;
};

export const invoiceTableColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    id: "id",
    enableSorting: false,
  }),
  columnHelper.accessor("invoiceNumber", {
    id: "invoiceNumber",
    enableSorting: false,
  }),
  columnHelper.accessor("customer", {
    id: "customer",
    sortFn: "alphanumeric",
  }),
  columnHelper.accessor("createdDate", {
    id: "createdDate",
    sortFn: invoiceDateSortFn,
  }),
  columnHelper.accessor("dueDate", {
    id: "dueDate",
    sortFn: invoiceDateSortFn,
  }),
  columnHelper.accessor("total", {
    id: "total",
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    id: "status",
    filterFn: invoiceStatusFilterFn,
  }),
]);
