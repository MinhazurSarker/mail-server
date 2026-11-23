"use client";

import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import CardHeader from "./card-header";
import RevenueStats from "./revenue-stats";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function EstimatedRevenue() {
  const t = useTranslations("crm.estimatedRevenue");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const series = [75.5];

  const options: ApexOptions = {
    colors: ["#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 340,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "82%",
        },
        track: {
          background: isDark ? "#1E2640" : "#E4E7EC",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          show: false,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#465FFF"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: "round",
    },
    labels: [t("goals")],
  };

  return (
    <Card className="h-full gap-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="relative mt-2 mb-6 flex-1 sm:mt-4">
        <div className="max-h-46 overflow-hidden" id="chartDarkStyle">
          <ReactApexChart
            options={options}
            series={series}
            type="radialBar"
            height={340}
          />
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center sm:bottom-5">
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {t("goals")}
          </p>
          <p className="mt-1 text-heading-five font-bold text-gray-800 dark:text-white/90">
            $3,96,700
          </p>
        </div>
      </div>

      <RevenueStats />
    </Card>
  );
}
