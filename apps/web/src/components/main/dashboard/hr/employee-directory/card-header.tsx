"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { EmployeeDepartmentKey, EmployeeStatusKey } from "./types";

export interface CardHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedDepartment?: EmployeeDepartmentKey;
  onDepartmentChange?: (dept: EmployeeDepartmentKey) => void;
  selectedStatus?: EmployeeStatusKey | "all";
  onStatusChange?: (status: EmployeeStatusKey | "all") => void;
  className?: string;
}

const departmentOptions: EmployeeDepartmentKey[] = [
  "all",
  "engineering",
  "hr",
  "sales",
  "marketing",
  "finance",
];

const statusOptions: (EmployeeStatusKey | "all")[] = [
  "all",
  "active",
  "onboarding",
  "onLeave",
];

export default function CardHeader({
  searchQuery = "",
  onSearchChange,
  selectedDepartment = "all",
  onDepartmentChange,
  selectedStatus = "all",
  onStatusChange,
  className = "",
}: CardHeaderProps) {
  const t = useTranslations("hr.employeeDirectory");

  return (
    <div
      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${className}`}
    >
      <div>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-10 w-full sm:w-60"
        />

        {/* Department Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="default"
                className="h-10 gap-1.5 border-gray-200 bg-white px-3.5 text-sm font-normal text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              />
            }
          >
            <span>{t(`departments.${selectedDepartment}`)}</span>
            <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {departmentOptions.map((dept) => (
              <DropdownMenuItem
                key={dept}
                onClick={() => onDepartmentChange?.(dept)}
              >
                {t(`departments.${dept}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="default"
                className="h-10 gap-1.5 border-gray-200 bg-white px-3.5 text-sm font-normal text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              />
            }
          >
            <span>
              {selectedStatus === "all"
                ? t("table.status")
                : t(`statuses.${selectedStatus}`)}
            </span>
            <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {statusOptions.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange?.(status)}
              >
                {status === "all" ? t("table.status") : t(`statuses.${status}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
