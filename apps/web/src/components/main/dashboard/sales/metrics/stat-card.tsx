"use client";

import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { chartCategories, defaultChartSeriesData } from "./data";
import { StatCardProps } from "./types";

export type { StatCardProps };

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getChartOptions = (color: string): ApexOptions => ({
  colors: [color],
  fill: {
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
    },
  },
  legend: {
    show: false,
  },
  chart: {
    fontFamily: "Outfit, sans-serif",
    height: 70,
    type: "area",
    parentHeightOffset: 0,
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  tooltip: {
    enabled: false,
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 1,
  },
  xaxis: {
    type: "datetime",
    categories: chartCategories,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: { show: false },
  },
});

export default function StatCard({
  icon,
  title,
  value,
  change,
  direction = "up",
  comparisonText,
  badge,
  chartColor,
  seriesName,
  chartData = defaultChartSeriesData,
  className,
  children,
}: StatCardProps) {
  const chartSeries = useMemo(
    () => [
      {
        name: seriesName || title,
        data: chartData,
      },
    ],
    [seriesName, title, chartData],
  );

  return (
    <Card
      className={cn(
        "rounded-xl border-0 border-none border-transparent bg-white p-5 sm:p-5 dark:border-transparent dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-400">
            {title}
          </h3>
          <div className="mt-1.5 flex gap-1.5">
            {badge !== undefined ? (
              badge
            ) : change ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  direction === "down"
                    ? "text-red-600 dark:text-red-500"
                    : "text-green-600 dark:text-green-500",
                )}
              >
                {direction === "down" ? (
                  <ArrowDownIcon className="size-3.5" />
                ) : (
                  <ArrowUpIcon className="size-3.5" />
                )}
                {change}
              </p>
            ) : null}
            {comparisonText && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {comparisonText}
              </p>
            )}
          </div>
        </div>
        {icon && <span>{icon}</span>}
      </div>

      <div className="flex items-end justify-between">
        <h2 className="w-1/2 text-3xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h2>
        {chartColor && (
          <div className="h-11 w-1/2">
            <Chart
              options={getChartOptions(chartColor)}
              series={chartSeries}
              type="area"
              height={44}
            />
          </div>
        )}
      </div>

      {children}
    </Card>
  );
}

export { StatCard as MetricCard };
