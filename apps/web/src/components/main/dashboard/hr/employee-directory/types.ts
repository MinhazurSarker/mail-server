export type EmployeeStatusKey = "active" | "onboarding" | "onLeave";

export type EmployeeRoleKey =
  | "seniorDeveloper"
  | "juniorDeveloper"
  | "hrSpecialist"
  | "accountExecutive";

export type EmployeeDepartmentKey =
  | "all"
  | "engineering"
  | "hr"
  | "sales"
  | "marketing"
  | "finance";

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  departmentKey: EmployeeDepartmentKey;
  roleKey: EmployeeRoleKey;
  statusKey: EmployeeStatusKey;
  joinedDate: string;
}

export interface EmployeeDirectoryProps {
  data?: Employee[];
  className?: string;
  itemsPerPage?: number;
  onDelete?: (employee: Employee) => void;
  onViewMore?: (employee: Employee) => void;
}
