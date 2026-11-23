"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import EmployeeGrowthChart from "./chart";
import { EmployeeGrowthProps, PeriodType } from "./types";

export default function EmployeeGrowth({ className }: EmployeeGrowthProps) {
  const t = useTranslations("hr.employeeGrowth");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("weekly");

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-gray-300 bg-white px-3 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
              />
            }
          >
            <span>{t(selectedPeriod)}</span>
            <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => setSelectedPeriod("weekly")}>
              {t("weekly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPeriod("monthly")}>
              {t("monthly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPeriod("yearly")}>
              {t("yearly")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EmployeeGrowthChart />
    </div>
  );
}
