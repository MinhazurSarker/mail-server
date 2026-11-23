import {
  columnFilteringFeature,
  ColumnFiltersState,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFns,
  globalFilteringFeature,
  Row,
  rowPaginationFeature,
  tableFeatures,
} from "@tanstack/react-table";
import { Employee, EmployeeDepartmentKey, EmployeeStatusKey } from "./types";

export type EmployeeTranslateFn = (key: string) => string;

export const employeeDirectoryTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
});

export const columnHelper = createColumnHelper<
  typeof employeeDirectoryTableFeatures,
  Employee
>();

export const createEmployeeDirectoryGlobalFilterFn = (
  t?: EmployeeTranslateFn,
) => {
  return (
    row: Row<typeof employeeDirectoryTableFeatures, Employee>,
    _columnId: string,
    filterValue: unknown,
  ): boolean => {
    const query = String(filterValue ?? "").trim().toLowerCase();
    if (!query) return true;

    const { name, email, departmentKey, roleKey, statusKey, joinedDate } =
      row.original;

    const deptName = t
      ? t(`departments.${departmentKey}`).toLowerCase()
      : departmentKey.toLowerCase();
    const roleName = t
      ? t(`roles.${roleKey}`).toLowerCase()
      : roleKey.toLowerCase();
    const statusName = t
      ? t(`statuses.${statusKey}`).toLowerCase()
      : statusKey.toLowerCase();

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      deptName.includes(query) ||
      roleName.includes(query) ||
      statusName.includes(query) ||
      joinedDate.toLowerCase().includes(query)
    );
  };
};

export const createEmployeeDirectoryColumnFilters = (
  department: EmployeeDepartmentKey,
  status: EmployeeStatusKey | "all",
): ColumnFiltersState => {
  const filters: ColumnFiltersState = [];

  if (department !== "all") {
    filters.push({ id: "department", value: department });
  }

  if (status !== "all") {
    filters.push({ id: "status", value: status });
  }

  return filters;
};

export const employeeDirectoryColumns = columnHelper.columns([
  columnHelper.accessor("id", {
    id: "id",
    enableColumnFilter: false,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor("name", {
    id: "name",
  }),
  columnHelper.accessor("email", {
    id: "email",
  }),
  columnHelper.accessor("departmentKey", {
    id: "department",
    filterFn: "equals",
  }),
  columnHelper.accessor("roleKey", {
    id: "role",
  }),
  columnHelper.accessor("statusKey", {
    id: "status",
    filterFn: "equals",
  }),
  columnHelper.accessor("joinedDate", {
    id: "joinedDate",
  }),
]);
