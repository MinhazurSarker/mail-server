"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import * as React from "react";
import CardHeader from "./card-header";
import StorageChart from "./chart";
import { defaultStorageCategories, defaultStorageMeta } from "./data";
import StorageIndicators from "./indicators";
import { StorageDetailsProps } from "./types";

export default function StorageDetails({
  className,
  title = defaultStorageMeta.title,
  freeSpace = defaultStorageMeta.freeSpace,
  usedSpace = defaultStorageMeta.usedSpace,
  totalSpace = defaultStorageMeta.totalSpace,
  categories = defaultStorageCategories,
  series,
  labels,
  colors,
}: StorageDetailsProps) {
  const chartSeries = React.useMemo(
    () => series ?? categories.map((cat) => cat.value),
    [series, categories],
  );
  const chartLabels = React.useMemo(
    () => labels ?? categories.map((cat) => cat.name),
    [labels, categories],
  );
  const chartColors = React.useMemo(
    () => colors ?? categories.map((cat) => cat.color),
    [colors, categories],
  );

  return (
    <Card
      className={cn(
        "h-full justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader title={title} freeSpace={freeSpace} />

      <StorageChart
        series={chartSeries}
        labels={chartLabels}
        colors={chartColors}
        categories={categories}
        usedSpace={usedSpace}
        totalSpace={totalSpace}
      />

      <StorageIndicators categories={categories} />
    </Card>
  );
}

export { default as CardHeader } from "./card-header";
export { default as StorageChart } from "./chart";
export * from "./data";
export { default as StorageIndicators } from "./indicators";
export * from "./types";
