"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { Employee } from "./types";

export interface EmployeeRowProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export default function EmployeeRow({
  employee,
  onEdit,
  onDelete,
}: EmployeeRowProps) {
  return (
    <TableRow className="border-b border-gray-200 last:border-b-0 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-white/2">
      {/* User Cell - Name only */}
      <TableCell className="border-e border-gray-200 px-4 py-3.5 sm:px-6 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {employee.user.name}
        </span>
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
      <TableCell className="border-e border-gray-200 px-4 py-3.5 text-start sm:px-6 dark:border-gray-800">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {employee.salary}
        </span>
      </TableCell>

      {/* Action Cell */}
      <TableCell className="px-4 py-3.5 text-start sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete?.(employee)}
            className="text-gray-500 transition-colors hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
            aria-label={`Delete ${employee.user.name}`}
          >
            <TrashBinIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(employee)}
            className="text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            aria-label={`Edit ${employee.user.name}`}
          >
            <PencilIcon className="size-5" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
