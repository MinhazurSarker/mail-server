export interface EmployeeUser {
  name: string;
  image?: string;
  initials?: string;
  avatarClassName?: string;
}

export interface Employee {
  id: string | number;
  user: EmployeeUser;
  position: string;
  office: string;
  age: number;
  startDate: string;
  salary: string;
}

export interface TableTwoProps {
  data?: Employee[];
  className?: string;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}
