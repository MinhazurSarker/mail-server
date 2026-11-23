import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table";
import { DeliveryActivity, DeliveryStatus, DeliveryTab } from "./types";

export const deliveryTableFeatures = tableFeatures({
  columnFilteringFeature,
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
  typeof deliveryTableFeatures,
  DeliveryActivity
>();

export const statusFilterFn = (
  row: Row<typeof deliveryTableFeatures, DeliveryActivity>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  const tab = filterValue as DeliveryTab;
  if (!tab || tab === "all") return true;

  const status = row.getValue(columnId) as DeliveryStatus;
  if (tab === "delivered") return status === "delivered";
  if (tab === "in-transit") return status === "in-transit";
  if (tab === "pending") return status === "pending";
  if (tab === "processing") return status === "processing";

  return false;
};

export const stringSearchFilterFn = (
  row: Row<typeof deliveryTableFeatures, DeliveryActivity>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;

  const cellValue = String(row.getValue(columnId) ?? "").toLowerCase();
  return cellValue.includes(query);
};

export const arrivalDateSortFn = (
  rowA: Row<typeof deliveryTableFeatures, DeliveryActivity>,
  rowB: Row<typeof deliveryTableFeatures, DeliveryActivity>,
  columnId: string,
): number => {
  const timeA = new Date(rowA.getValue(columnId) as string).getTime() || 0;
  const timeB = new Date(rowB.getValue(columnId) as string).getTime() || 0;
  return timeA - timeB;
};

export const createDeliveryColumnFilters = (
  selectedTab: DeliveryTab,
  categoryFilter: string,
  companyFilter: string,
): ColumnFiltersState => {
  const filters: ColumnFiltersState = [];

  if (selectedTab !== "all") {
    filters.push({ id: "status", value: selectedTab });
  }

  if (categoryFilter.trim()) {
    filters.push({ id: "category", value: categoryFilter.trim() });
  }

  if (companyFilter.trim()) {
    filters.push({ id: "company", value: companyFilter.trim() });
  }

  return filters;
};

export const deliveryTableColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    id: "id",
    enableSorting: false,
  }),
  columnHelper.accessor("category", {
    id: "category",
    sortFn: "alphanumeric",
    filterFn: stringSearchFilterFn,
  }),
  columnHelper.accessor("company", {
    id: "company",
    sortFn: "alphanumeric",
    filterFn: stringSearchFilterFn,
  }),
  columnHelper.accessor("arrival", {
    id: "arrival",
    sortFn: arrivalDateSortFn,
  }),
  columnHelper.accessor("route", {
    id: "route",
    enableSorting: false,
  }),
  columnHelper.accessor("price", {
    id: "price",
    enableSorting: false,
  }),
  columnHelper.accessor("status", {
    id: "status",
    filterFn: statusFilterFn,
  }),
]);
