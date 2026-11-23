"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import CardHeader from "./card-header";
import ChartIndicators from "./chart-indicators";
import { conversionSeriesConfig, monthKeys } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ConversionChart() {
  const { theme } = useTheme();
  const t = useTranslations("saas.conversionFunnel");
  const tMonths = useTranslations("ecommerce.months");

  const categories = useMemo(
    () => monthKeys.map((key) => tMonths(key)),
    [tMonths],
  );

  const series = useMemo(
    () =>
      conversionSeriesConfig.map((item) => ({
        name: t(`series.${item.nameKey}`),
        data: item.data,
      })),
    [t],
  );

  const options: ApexOptions = useMemo(
    () => ({
      colors: conversionSeriesConfig.map((item) => item.color),
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        stacked: true,
        height: 240,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "39%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
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
        min: 0,
        max: 120,
        tickAmount: 4,
        labels: {
          style: {
            fontSize: "12px",
            fontFamily: "Outfit, sans-serif",
            colors: theme === "dark" ? "#94A3B8" : "#6B7280",
          },
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
      legend: {
        show: false,
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        x: {
          show: true,
        },
        y: {
          formatter: (val: number) => val.toString(),
        },
      },
    }),
    [categories, theme],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="mt-6">
        <ChartIndicators />
      </div>

      <ScrollArea className="max-w-full">
        <div className="-ms-4 min-w-130 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={240}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
