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
import JobStatisticsChart from "./chart";
import { jobStatisticsData } from "./data";
import { JobStatisticsProps, PeriodType } from "./types";

export default function JobStatistics({
  className,
  initialPeriod = "monthly",
  period: controlledPeriod,
  onPeriodChange: setControlledPeriod,
  data = jobStatisticsData,
}: JobStatisticsProps) {
  const t = useTranslations("hr.jobStatistics");
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

  const currentData = data[selectedPeriod] ?? data.monthly;

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-outfit text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-[10px] border-gray-300 bg-white py-2 ps-3 pe-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
              />
            }
          >
            <span>{t(selectedPeriod)}</span>
            <ChevronDownIcon className="ms-1 size-4 text-gray-500 dark:text-gray-400" />
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

      {/* Chart */}
      <div className="my-5 flex items-center justify-center sm:my-6">
        <JobStatisticsChart
          totalJobs={currentData.totalJobs}
          metrics={currentData.metrics}
        />
      </div>

      {/* Metrics Row (Job Status Card) */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-white rtl:divide-x-reverse dark:divide-gray-800 dark:border-gray-800 dark:bg-white/3">
        {currentData.metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex min-w-0 items-center justify-start gap-1.5 px-2.5 py-3 sm:gap-2 sm:px-4 sm:py-3.5"
          >
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <span
                className={cn(
                  "h-4.5 w-1.5 shrink-0 rounded-full",
                  metric.indicatorColor,
                )}
              />
              <span className="font-outfit text-base font-bold text-gray-800 sm:text-lg dark:text-white/90">
                {metric.value}
              </span>
            </div>
            <span
              className="truncate text-xs font-medium whitespace-nowrap text-gray-500 sm:text-sm dark:text-gray-400"
              title={t(metric.key)}
            >
              {t(metric.key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
