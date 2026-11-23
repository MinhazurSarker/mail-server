"use client";

import { useTheme } from "@/context/theme-context";
import { ApexOptions, ApexTooltipCustomOpts } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import CardHeader from "./card-header";
import TokenStats from "./token-stats";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function TokenUsageChart() {
  const t = useTranslations("aiDashboard.apiToken");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const series = [7, 2, 4.5];

  const options: ApexOptions = useMemo(
    () => ({
      colors: ["#7592FF", "#BDB4FE", "#74D4FF"],
      labels: ["GPT", "Gemini", "xAI"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "donut",
      },
      stroke: {
        show: true,
        width: 4,
        colors: [isDark ? "#101828" : "#ffffff"],
      },
      plotOptions: {
        pie: {
          borderRadius: 6,
          donut: {
            size: "75%",
            labels: {
              show: true,
              name: {
                show: true,
                offsetY: 20,
                color: isDark ? "#9CA3AF" : "#6B7280",
                fontSize: "12px",
                fontWeight: "400",
                fontFamily: "Outfit, sans-serif",
                formatter: () => t("totalApiTokenUsed"),
              },
              value: {
                show: true,
                offsetY: -14,
                color: isDark ? "rgba(255,255,255,0.90)" : "#1E2939",
                fontSize: "24px",
                fontWeight: "600",
                fontFamily: "Outfit, sans-serif",
                formatter: () => "13.5M",
              },
              total: {
                show: true,
                showAlways: true,
                label: t("totalApiTokenUsed"),
                color: isDark ? "#9CA3AF" : "#6B7280",
                fontSize: "12px",
                fontWeight: "400",
                fontFamily: "Outfit, sans-serif",
                formatter: () => "13.5M",
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, w }: ApexTooltipCustomOpts) {
          const color = w.config?.colors?.[seriesIndex] ?? "#7592FF";
          const label = w.config?.labels?.[seriesIndex] ?? "";
          return (
            '<div class="rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">' +
            '<div class="flex items-center gap-2">' +
            ' <div class="size-2 rounded-full" style="background-color: ' +
            color +
            '"></div>' +
            ' <span class="text-xs font-medium text-gray-800 dark:text-white/90">' +
            label +
            "</span>" +
            "</div>" +
            '<div class="mt-1 text-xs text-gray-500 dark:text-gray-400">' +
            series[seriesIndex] +
            "M " +
            t("tokenUsed") +
            "</div>" +
            "</div>"
          );
        },
      },
      legend: {
        show: false,
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              width: "100%",
              height: 175,
            },
          },
        },
      ],
    }),
    [isDark, t],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-3 pt-2 pb-1 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div
        className="api-token-chart my-6 flex justify-center"
        id="chartDarkStyle"
      >
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={175}
          width="100%"
        />
      </div>

      <TokenStats />
    </div>
  );
}
