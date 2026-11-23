"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { TableCell, TableRow } from "@/components/ui/table";
import { HorizontalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Employee, EmployeeStatusKey } from "./types";

export interface EmployeeRowProps {
  employee: Employee;
  onViewMore?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

const statusBadgeColorMap: Record<
  EmployeeStatusKey,
  "success" | "primary" | "error"
> = {
  active: "success",
  onboarding: "primary",
  onLeave: "error",
};

export default function EmployeeRow({
  employee,
  onViewMore,
  onDelete,
}: EmployeeRowProps) {
  const t = useTranslations("hr.employeeDirectory");
  const tCommon = useTranslations("common");

  return (
    <TableRow className="h-18 border-b border-gray-100 last:border-b-0 dark:border-gray-800">
      <TableCell className="py-4 ps-6 pe-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <Image
              src={employee.avatar}
              alt={employee.name}
              width={40}
              height={40}
              className="size-full object-cover"
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
              {employee.name}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {employee.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
        {t(`departments.${employee.departmentKey}`)}
      </TableCell>
      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
        {t(`roles.${employee.roleKey}`)}
      </TableCell>
      <TableCell className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant="light"
          color={statusBadgeColorMap[employee.statusKey]}
          size="sm"
        >
          {t(`statuses.${employee.statusKey}`)}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300">
        {employee.joinedDate}
      </TableCell>
      <TableCell className="py-4 ps-4 pe-6 text-end whitespace-nowrap">
        <div className="inline-flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Actions"
                />
              }
            >
              <HorizontalDotsIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 min-w-36 p-1">
              <DropdownMenuItem onClick={() => onViewMore?.(employee)}>
                {tCommon("viewMore")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete?.(employee)}
              >
                {tCommon("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
