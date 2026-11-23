"use client";

import dynamic from "next/dynamic";
import { churnChartOptions, churnSeries } from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ChurnChart() {
  return (
    <div className="h-10.5 w-25">
      <ReactApexChart
        options={churnChartOptions}
        series={churnSeries}
        type="area"
        height={42}
      />
    </div>
  );
}
