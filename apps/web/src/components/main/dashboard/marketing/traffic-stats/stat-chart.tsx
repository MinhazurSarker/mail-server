"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StatChartProps {
  data: number[];
  isPositive: boolean;
}

export default function StatChart({ data, isPositive }: StatChartProps) {
  const chartColor = isPositive ? "#12B76A" : "#F04438";

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 50,
        sparkline: {
          enabled: true,
        },
        animations: {
          enabled: true,
          speed: 400,
        },
      },
      colors: [chartColor],
      stroke: {
        curve: "smooth",
        width: 1.5,
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.45,
          opacityTo: 0,
        },
      },
      tooltip: {
        enabled: false,
      },
      dataLabels: {
        enabled: false,
      },
    }),
    [chartColor],
  );

  const series = useMemo(
    () => [
      {
        name: "metric",
        data,
      },
    ],
    [data],
  );

  return (
    <div className="h-12.5 w-25 shrink-0 sm:w-30">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={50}
      />
    </div>
  );
}
