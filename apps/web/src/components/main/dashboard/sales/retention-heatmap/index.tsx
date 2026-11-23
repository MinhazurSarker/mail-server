"use client";

import { cn } from "@/utils";
import CardHeader from "./card-header";
import HeatmapGrid from "./heatmap-grid";
import RetentionStats from "./retention-stats";

interface RetentionHeatmapProps {
  className?: string;
}

export default function RetentionHeatmap({ className }: RetentionHeatmapProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader />
      <RetentionStats />
      <HeatmapGrid />
    </div>
  );
}
