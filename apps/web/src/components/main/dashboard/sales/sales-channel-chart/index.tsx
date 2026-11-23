"use client";

import { cn } from "@/utils";
import CardHeader from "./card-header";
import ChannelBarChart from "./channel-bar-chart";
import ChannelOverview from "./channel-overview";
import ChannelStats from "./channel-stats";

interface SalesChannelChartProps {
  className?: string;
}

export default function SalesChannelChart({
  className,
}: SalesChannelChartProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader />
      <ChannelStats />
      <ChannelBarChart />
      <ChannelOverview />
    </div>
  );
}
