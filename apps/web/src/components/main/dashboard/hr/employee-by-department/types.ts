export type DepartmentKey =
  | "engineering"
  | "marketing"
  | "sales"
  | "hr"
  | "finance"
  | "others";

export interface DepartmentItem {
  id: string;
  key: DepartmentKey;
  percentage: number;
  count: number;
  color: string;
}

export interface EmployeeByDepartmentProps {
  className?: string;
}
