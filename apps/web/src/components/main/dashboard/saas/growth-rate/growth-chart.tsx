"use client";

import dynamic from "next/dynamic";
import { growthChartOptions, growthSeries } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function GrowthChart() {
  return (
    <div className="h-10.5 w-25">
      <ReactApexChart
        options={growthChartOptions}
        series={growthSeries}
        type="area"
        height={42}
      />
    </div>
  );
}
