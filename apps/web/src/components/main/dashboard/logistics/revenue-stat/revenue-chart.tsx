"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { revenueChartOptions, revenueSeries } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RevenueChart() {
  const t = useTranslations("logistics.revenueEarned");

  const series = [
    {
      name: t("newSales"),
      data: revenueSeries[0].data,
    },
  ];

  return (
    <div className="h-15 w-full max-w-37.5">
      <ReactApexChart
        options={revenueChartOptions}
        series={series}
        type="area"
        height={70}
      />
    </div>
  );
}
