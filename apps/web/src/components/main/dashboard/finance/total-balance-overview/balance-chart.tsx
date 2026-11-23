"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface BalanceChartProps {
  seriesName?: string;
  data?: number[];
}

const defaultChartData = [
  20, 24, 23, 25, 30, 35, 40, 30, 32, 33, 29, 28, 27, 29, 45, 58, 70, 80,
  72, 68, 85, 79, 77, 75,
];

export default function BalanceChart({
  seriesName = "Balance",
  data = defaultChartData,
}: BalanceChartProps) {
  const chartOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 70,
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.65,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
    },
    tooltip: {
      enabled: false,
    },
  };

  const chartSeries = [
    {
      name: seriesName,
      data,
    },
  ];

  return (
    <div className="ms-auto w-25 sm:w-37.5">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={70}
      />
    </div>
  );
}
