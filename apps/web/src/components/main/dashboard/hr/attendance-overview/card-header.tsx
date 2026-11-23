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
import { attendancePeriods } from "./data";
import { CardHeaderProps } from "./types";

export default function CardHeader({
  selectedPeriod,
  onSelectPeriod,
}: CardHeaderProps) {
  const t = useTranslations("hr.attendanceOverview");

  return (
    <div className="mb-6 flex items-center justify-between">
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
          {attendancePeriods.map((period) => {
            const isSelected = selectedPeriod === period;
            return (
              <DropdownMenuItem
                key={period}
                onClick={() => onSelectPeriod(period)}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-gray-100 font-medium dark:bg-white/5",
                )}
              >
                {t(period)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
