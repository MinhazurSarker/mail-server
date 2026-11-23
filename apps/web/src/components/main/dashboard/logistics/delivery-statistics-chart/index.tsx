"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import ChartIndicators from "./chart-indicators";
import {
  deliveryIndicators,
  deliverySeriesByTimeframe,
  monthKeys,
  Timeframe,
} from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DeliveryStatisticsChart() {
  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>("monthly");

  const t = useTranslations("logistics.deliveryStatistics");
  const tMonths = useTranslations("ecommerce.months");

  const categories = useMemo(
    () => monthKeys.map((key) => tMonths(key)),
    [tMonths],
  );

  const series = useMemo(
    () =>
      deliverySeriesByTimeframe[selectedTimeframe].map((item) => ({
        name: t(item.nameKey),
        data: item.data,
      })),
    [selectedTimeframe, t],
  );

  const options: ApexOptions = useMemo(
    () => ({
      colors: deliveryIndicators.map((item) => item.color),
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 260,
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
          columnWidth: "48%",
          borderRadius: 3,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 3,
        colors: ["transparent"],
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
        max: 200,
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
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 sm:pb-0 dark:border-gray-800 dark:bg-white/3">
      <CardHeader
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />
      <ChartIndicators />
      <ScrollArea className="w-full">
        <div className="-ms-4 min-w-162.5 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={260}
          />
        </div>
      </ScrollArea>
    </Card>
  );
}
