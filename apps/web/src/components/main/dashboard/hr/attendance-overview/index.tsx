"use client";

import { cn } from "@/utils";
import { useState } from "react";
import CardHeader from "./card-header";
import { attendanceHeatmapData, attendanceHeatmapDataByPeriod } from "./data";
import HeatmapGrid from "./heatmap-grid";
import { AttendanceOverviewProps, PeriodType } from "./types";

export default function AttendanceOverview({
  className,
  initialPeriod = "monthly",
  period: controlledPeriod,
  onPeriodChange: setControlledPeriod,
  data: customData,
}: AttendanceOverviewProps) {
  const [internalPeriod, setInternalPeriod] =
    useState<PeriodType>(initialPeriod);

  const selectedPeriod = controlledPeriod ?? internalPeriod;

  const handlePeriodChange = (period: PeriodType) => {
    if (setControlledPeriod) {
      setControlledPeriod(period);
    } else {
      setInternalPeriod(period);
    }
  };

  const currentData =
    (customData ?? attendanceHeatmapDataByPeriod)[selectedPeriod] ??
    attendanceHeatmapData;

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
      />
      <HeatmapGrid data={currentData} />
    </div>
  );
}

