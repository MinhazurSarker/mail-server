import {
  columnFilteringFeature,
  ColumnFiltersState,
  createColumnHelper,
  createFilteredRowModel,
  filterFns,
  globalFilteringFeature,
  Row,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { StatusKey, Transaction } from "./types";

export const transactionTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns,
});

export const columnHelper = createColumnHelper<
  typeof transactionTableFeatures,
  Transaction
>();

export const createTransactionGlobalFilterFn = (
  translate?: (key: string) => string,
) => {
  return (
    row: Row<typeof transactionTableFeatures, Transaction>,
    _columnId: string,
    filterValue: unknown,
  ): boolean => {
    const query = String(filterValue ?? "").trim().toLowerCase();
    if (!query) return true;

    const { orderId, activityKey, price, date, statusKey } = row.original;
    const activity = translate
      ? translate(`activities.${activityKey}`).toLowerCase()
      : activityKey.toLowerCase();
    const status = translate
      ? translate(`statuses.${statusKey}`).toLowerCase()
      : statusKey.toLowerCase();

    return (
      orderId.toLowerCase().includes(query) ||
      activity.includes(query) ||
      price.toLowerCase().includes(query) ||
      date.toLowerCase().includes(query) ||
      status.includes(query)
    );
  };
};

export const createTransactionColumnFilters = (
  statusFilter?: StatusKey | "all",
): ColumnFiltersState => {
  if (!statusFilter || statusFilter === "all") return [];
  return [{ id: "status", value: statusFilter }];
};

export const transactionTableColumns = columnHelper.columns([
  columnHelper.accessor("orderId", {
    id: "orderId",
  }),
  columnHelper.accessor("activityKey", {
    id: "activity",
  }),
  columnHelper.accessor("price", {
    id: "price",
  }),
  columnHelper.accessor("date", {
    id: "date",
  }),
  columnHelper.accessor("statusKey", {
    id: "status",
    filterFn: "equals",
  }),
  columnHelper.display({
    id: "actions",
  }),
]);
