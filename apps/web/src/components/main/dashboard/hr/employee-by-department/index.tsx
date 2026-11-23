"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ArrowUpIcon, HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { departmentData } from "./data";
import { EmployeeByDepartmentProps } from "./types";

export default function EmployeeByDepartment({
  className,
}: EmployeeByDepartmentProps) {
  const t = useTranslations("hr.employeeByDepartment");

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-center justify-between ps-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              />
            }
          >
            <HorizontalDotsIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>{t("viewDetails")}</DropdownMenuItem>
            <DropdownMenuItem>{t("exportData")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 flex items-end gap-3 ps-4">
        <span className="text-3xl font-semibold text-gray-800 dark:text-white/90">
          1,248
        </span>
        <div className="mb-1 flex items-center gap-1.5">
          <Badge variant="light" color="success" size="sm">
            <ArrowUpIcon className="size-3.5" />
            <span>3.2%</span>
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("thanLastMonth")}
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mt-4 flex h-10 w-full items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        {departmentData.map((dept, index) => {
          const isFirst = index === 0;
          const isLast = index === departmentData.length - 1;
          const deptName = t(`departments.${dept.key}`);
          return (
            <div
              key={dept.id}
              className={cn(
                "h-full transition-all",
                isFirst && "rounded-s-lg",
                isLast && "rounded-e-lg",
                !isFirst && !isLast && "rounded-sm",
              )}
              style={{
                width: `${dept.percentage}%`,
                backgroundColor: dept.color,
              }}
              title={`${deptName}: ${dept.percentage}% (${dept.count})`}
            />
          );
        })}
      </div>

      {/* Departments List Table */}
      <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        {departmentData.map((dept) => (
          <div
            key={dept.id}
            className="flex items-center justify-between px-3.5 py-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t(`departments.${dept.key}`)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-gray-800 dark:text-white/90">
                {dept.percentage}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ({dept.count})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
