"use client";

import { useTheme } from "@/context/theme-context";
import { ApexOptions, ApexTooltipCustomOpts } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import {
  crmStatisticsMetrics,
  getCrmStatisticsData,
  StatisticTab,
} from "./data";
import StatisticsMetrics from "./statistics-metrics";

interface TooltipSeriesItem {
  name?: string;
}

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CrmStatisticsChart() {
  const { theme } = useTheme();
  const t = useTranslations("crm.statistics");
  const tMonths = useTranslations("ecommerce.months");

  const [selectedTab, setSelectedTab] = useState<StatisticTab>("monthly");

  const { categories, series } = useMemo(
    () => getCrmStatisticsData(selectedTab, t, tMonths),
    [selectedTab, t, tMonths],
  );

  const metrics = useMemo(
    () => crmStatisticsMetrics[selectedTab],
    [selectedTab],
  );

  const options: ApexOptions = useMemo(
    () => ({
      legend: {
        show: false,
      },
      colors: ["#465FFF", "#9CB9FF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 250,
        type: "area",
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: "smooth",
        width: [2, 2],
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
        },
      },
      markers: {
        size: 0,
        colors: ["#ffffff"],
        strokeColors: ["#465FFF", "#9CB9FF"],
        strokeWidth: 2,
        hover: {
          size: 5,
        },
      },
      grid: {
        borderColor: theme === "dark" ? "#1E2640" : "#F3F4F6",
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        custom: function ({
          series: chartSeries,
          dataPointIndex,
          w,
        }: ApexTooltipCustomOpts) {
          const category =
            w.globals?.categoryLabels?.[dataPointIndex] ??
            w.config.xaxis?.categories?.[dataPointIndex] ??
            "";
          const colors = w.config.colors ?? ["#465FFF", "#9CB9FF"];
          const seriesList =
            (w.config.series as unknown as TooltipSeriesItem[]) ?? [];

          const rows = seriesList
            .map((s, idx) => {
              const val = chartSeries[idx]?.[dataPointIndex];
              const color = colors[idx] ?? "#465FFF";
              const formattedVal =
                typeof val === "number" ? val.toLocaleString() : (val ?? "");
              return `
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full shrink-0" style="background-color: ${color}"></span>
                    <span class="w-13 text-xs text-gray-800 dark:text-white/90">${s.name ?? ""}</span>
                    <span class="text-xs font-medium text-gray-400 dark:text-gray-500">:</span>
                  </div>
                  <span class="text-xs font-medium text-gray-800 dark:text-white/90">${formattedVal}</span>
                </div>
              `;
            })
            .join("");

          return `
            <div class="min-w-32.5">
              <p class="mb-1 text-[10px] leading-4 text-gray-500 dark:text-gray-400">${category}</p>
              <div class="flex flex-col gap-1">
                ${rows}
              </div>
            </div>
          `;
        },
      },
      xaxis: {
        type: "category",
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
          width: 2,
          position: "back",
          opacity: 1,
          stroke: {
            width: 0,
            color: "none",
          },
          fill: {
            type: "gradient",
            gradient: {
              colorFrom:
                theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "#ffffff",
              colorTo: "#9CB9FF",
              stops: [0, 100],
              opacityFrom: 1,
              opacityTo: 1,
            },
          },
        },
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Outfit, sans-serif",
            colors: theme === "dark" ? "#94A3B8" : "#6B7280",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Outfit, sans-serif",
            colors: theme === "dark" ? "#94A3B8" : "#6B7280",
          },
        },
        title: {
          text: undefined,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 220,
            },
          },
        },
        {
          breakpoint: 1600,
          options: {
            chart: {
              height: 220,
            },
          },
        },
        {
          breakpoint: 2600,
          options: {
            chart: {
              height: 250,
            },
          },
        },
      ],
    }),
    [categories, theme],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader selectedTab={selectedTab} onTabChange={setSelectedTab} />

      <StatisticsMetrics metrics={metrics} />

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="-ms-4 min-w-162.5 ps-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
