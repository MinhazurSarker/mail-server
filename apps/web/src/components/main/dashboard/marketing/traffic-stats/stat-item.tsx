"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import StatChart from "./stat-chart";
import { StatMetric } from "./types";

interface StatItemProps {
  metric: StatMetric;
  isLast?: boolean;
}

export default function StatItem({ metric, isLast }: StatItemProps) {
  const t = useTranslations("marketing.trafficStats");

  return (
    <div
      className={cn(
        "flex items-end justify-between py-5",
        !isLast && "border-b border-gray-100 dark:border-gray-800",
      )}
    >
      <div>
        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
          {t(metric.labelKey)}
        </p>
        <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {metric.value}
        </h4>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium",
              metric.isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500",
            )}
          >
            {metric.change}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t(metric.comparisonKey)}
          </span>
        </div>
      </div>

      <StatChart data={metric.chartData} isPositive={metric.isPositive} />
    </div>
  );
}
