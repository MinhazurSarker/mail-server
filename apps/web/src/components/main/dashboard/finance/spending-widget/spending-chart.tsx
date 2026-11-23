"use client";

import { useTheme } from "@/context/theme-context";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { getSpendingChartOptions } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SpendingChartProps {
  series: {
    name: string;
    data: number[];
  }[];
}

export default function SpendingChart({ series }: SpendingChartProps) {
  const { theme } = useTheme();

  const options = useMemo(() => {
    return getSpendingChartOptions({ theme });
  }, [theme]);

  return (
    <div className="-ms-1 w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={50}
        width="100%"
      />
    </div>
  );
}
