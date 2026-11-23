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
import { quickStatsData } from "./data";
import StatCard from "./stat-card";
import { PeriodType, QuickStatsProps } from "./types";

export default function QuickStats({
  className,
  initialPeriod = "monthly",
  period: controlledPeriod,
  onPeriodChange: setControlledPeriod,
  data = quickStatsData,
}: QuickStatsProps) {
  const t = useTranslations("hr.quickStats");
  const [internalPeriod, setInternalPeriod] =
    useState<PeriodType>(initialPeriod);

  const selectedPeriod = controlledPeriod ?? internalPeriod;
  const handlePeriodChange = (period: PeriodType) => {
    if (setControlledPeriod) {
      setControlledPeriod(period);
    } else {
      setInternalPeriod(period);
    }
  };

  const currentStats = data[selectedPeriod] ?? data.monthly;

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between p-4">
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
            <DropdownMenuItem onClick={() => handlePeriodChange("monthly")}>
              {t("monthly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodChange("weekly")}>
              {t("weekly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePeriodChange("yearly")}>
              {t("yearly")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {currentStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </div>
  );
}
