"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { TabMetrics } from "./data";

interface StatisticsMetricsProps {
  metrics: TabMetrics;
}

export default function StatisticsMetrics({ metrics }: StatisticsMetricsProps) {
  const t = useTranslations("crm.statistics");

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-9">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
            {metrics.primary.value}
          </h4>
          <Badge
            variant="light"
            color={metrics.primary.direction === "up" ? "success" : "error"}
            size="sm"
          >
            {metrics.primary.change}
          </Badge>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t("avgYearlyProfit")}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
            {metrics.secondary.value}
          </h4>
          <Badge
            variant="light"
            color={metrics.secondary.direction === "up" ? "success" : "error"}
            size="sm"
          >
            {metrics.secondary.change}
          </Badge>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t("avgYearlyProfit")}
        </span>
      </div>
    </div>
  );
}
