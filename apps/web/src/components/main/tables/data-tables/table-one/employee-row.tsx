"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "./types";

export interface EmployeeRowProps {
  employee: Employee;
}

export default function EmployeeRow({ employee }: EmployeeRowProps) {
  const initials =
    employee.user.initials ??
    employee.user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <TableRow className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-white/2">
      {/* User Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 sm:px-6 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {employee.user.image && (
              <AvatarImage src={employee.user.image} alt={employee.user.name} />
            )}
            <AvatarFallback className="text-xs font-semibold select-none">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {employee.user.name}
          </span>
        </div>
      </TableCell>

      {/* Position Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {employee.position}
        </span>
      </TableCell>

      {/* Office Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {employee.office}
        </span>
      </TableCell>

      {/* Age Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {employee.age}
        </span>
      </TableCell>

      {/* Start Date Cell */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {employee.startDate}
        </span>
      </TableCell>

      {/* Salary Cell */}
      <TableCell className="px-4 py-3.5 text-start sm:px-6">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {employee.salary}
        </span>
      </TableCell>
    </TableRow>
  );
}
