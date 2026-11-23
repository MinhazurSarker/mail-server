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
import { CrmOrder, DealStatus } from "./types";

export const crmRecentOrdersTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns,
});

export const columnHelper = createColumnHelper<
  typeof crmRecentOrdersTableFeatures,
  CrmOrder
>();

export const crmRecentOrdersGlobalFilterFn = (
  row: Row<typeof crmRecentOrdersTableFeatures, CrmOrder>,
  _columnId: string,
  filterValue: unknown,
): boolean => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;

  const { dealId, user } = row.original;
  return (
    dealId.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
};

export const createCrmRecentOrdersColumnFilters = (
  statusFilter: DealStatus | "all",
): ColumnFiltersState => {
  if (statusFilter === "all") return [];
  return [{ id: "status", value: statusFilter }];
};

export const crmRecentOrdersColumns = columnHelper.columns([
  columnHelper.accessor("dealId", {
    id: "dealId",
  }),
  columnHelper.accessor((row) => row.user.name, {
    id: "customer",
  }),
  columnHelper.accessor("productKey", {
    id: "productKey",
  }),
  columnHelper.accessor("dealValue", {
    id: "dealValue",
  }),
  columnHelper.accessor("closeDate", {
    id: "closeDate",
  }),
  columnHelper.accessor("status", {
    id: "status",
    filterFn: "equals",
  }),
  columnHelper.display({
    id: "action",
  }),
]);

