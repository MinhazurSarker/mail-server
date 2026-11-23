"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { CHANNEL_STATS } from "./data";
import { ChannelStatsData } from "./types";

interface ChannelStatsProps extends Partial<ChannelStatsData> {
  trendText?: string;
}

export default function ChannelStats({
  total = CHANNEL_STATS.total,
  change = CHANNEL_STATS.change,
  isIncrease = CHANNEL_STATS.isIncrease,
  trendText,
}: ChannelStatsProps) {
  const t = useTranslations("sales.salesByChannel");

  return (
    <div className="mt-4 mb-6 flex items-baseline gap-2">
      <h4 className="text-3xl font-medium text-gray-800 dark:text-white/90">
        {total}
      </h4>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isIncrease
              ? "text-green-600 dark:text-green-500"
              : "text-red-600 dark:text-red-500",
          )}
        >
          {isIncrease ? (
            <ArrowUpIcon className="size-3.5 rotate-45 rtl:-rotate-45" />
          ) : (
            <ArrowDownIcon className="size-3.5 rotate-45 rtl:-rotate-45" />
          )}

          {change}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trendText ?? t("increasedVsLastWeek")}
        </span>
      </div>
    </div>
  );
}
