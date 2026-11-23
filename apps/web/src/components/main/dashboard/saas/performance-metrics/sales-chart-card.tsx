"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { useTranslations } from "next-intl";
import SalesBarChart from "./sales-bar-chart";
import { PerformanceMetricData } from "./types";

interface SalesChartCardProps {
  data: PerformanceMetricData;
}

export default function SalesChartCard({ data }: SalesChartCardProps) {
  const t = useTranslations("saas.productPerformance");

  return (
    <div className="rounded-xl border border-gray-100 p-5 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t(data.mainStat.titleKey)}
          </span>
          <h4 className="mt-1 text-3xl font-bold text-gray-800 dark:text-white/90">
            {data.mainStat.value}
          </h4>
        </div>

        <Badge
          variant="light"
          color={data.mainStat.isPositive ? "success" : "error"}
          size="default"
        >
          {data.mainStat.isPositive ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )}
          {data.mainStat.change}
        </Badge>
      </div>

      <div className="mt-4">
        <ScrollArea className="max-w-full">
          <SalesBarChart data={data.chartData} categories={data.categories} />
        </ScrollArea>
      </div>
    </div>
  );
}
