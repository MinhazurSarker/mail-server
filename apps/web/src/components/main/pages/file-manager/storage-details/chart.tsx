"use client";

import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import * as React from "react";
import {
  defaultStorageCategories,
  defaultStorageColors,
  defaultStorageLabels,
  defaultStorageMeta,
  defaultStorageSeries,
} from "./data";
import { StorageCategoryItem } from "./types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartProps {
  series?: number[];
  labels?: string[];
  colors?: string[];
  categories?: StorageCategoryItem[];
  usedSpace?: string;
  totalSpace?: string;
}

export default function StorageChart({
  series = defaultStorageSeries,
  labels = defaultStorageLabels,
  colors = defaultStorageColors,
  categories = defaultStorageCategories,
  usedSpace = defaultStorageMeta.usedSpace,
  totalSpace = defaultStorageMeta.totalSpace,
}: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options: ApexOptions = React.useMemo(
    () => ({
      colors,
      labels,
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "donut",
        width: 240,
        height: 240,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: "72%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: 20,
                color: isDark ? "#9CA3AF" : "#6A7282",
                fontSize: "12px",
                fontWeight: "400",
                fontFamily: "Outfit, sans-serif",
                formatter: () => `Used of ${totalSpace}`,
              },
              value: {
                show: true,
                offsetY: -14,
                color: isDark ? "#ffffff" : "#1D2939",
                fontSize: "24px",
                fontWeight: "700",
                fontFamily: "Outfit, sans-serif",
                formatter: () => usedSpace,
              },
              total: {
                show: true,
                showAlways: true,
                label: `Used of ${totalSpace}`,
                fontSize: "12px",
                fontWeight: "400",
                fontFamily: "Outfit, sans-serif",
                color: isDark ? "#9CA3AF" : "#6A7282",
                formatter: () => usedSpace,
              },
            },
          },
        },
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: "none",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        custom: ({ seriesIndex }: { seriesIndex: number }) => {
          const item = categories[seriesIndex];
          const name = item?.name || labels[seriesIndex] || "";
          const size = item?.size || `${series[seriesIndex]} GB`;
          const color = item?.color || colors[seriesIndex] || "#465FFF";
          const total = series.reduce((sum, value) => sum + value, 0);
          const percent = total
            ? Math.round(((series[seriesIndex] || 0) / total) * 100)
            : 0;

          return `
            <div class="flex min-w-36 flex-col gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
              <div class="flex items-center gap-1.5">
                <span class="size-2.5 shrink-0 rounded-full" style="background-color: ${color}"></span>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">${name}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm font-semibold text-gray-800 dark:text-white/90">${size}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${percent}%</span>
              </div>
            </div>
          `;
        },
      },
      stroke: {
        show: false,
        width: 4,
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              width: 200,
              height: 200,
            },
          },
        },
      ],
    }),
    [categories, colors, isDark, labels, series, totalSpace, usedSpace],
  );

  return (
    <div className="flex justify-center" id="chartDarkStyle">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        width={240}
        height={240}
      />
    </div>
  );
}

