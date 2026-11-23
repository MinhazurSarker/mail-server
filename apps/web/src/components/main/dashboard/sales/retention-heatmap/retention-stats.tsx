"use client";

import { ArrowUpIcon } from "@/icons";
import { useTranslations } from "next-intl";

interface RetentionStatsProps {
  value?: string;
  change?: string;
  trendText?: string;
}

export default function RetentionStats({
  value = "24%",
  change = "3.2%",
  trendText,
}: RetentionStatsProps) {
  const t = useTranslations("sales.userRetention");

  return (
    <div className="mt-4 mb-5 flex items-baseline gap-2">
      <h4 className="text-3xl font-medium text-gray-800 dark:text-white/90">
        {value}
      </h4>
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500">
          <ArrowUpIcon className="size-3.5 rotate-45 rtl:-rotate-45" />
          {change}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trendText ?? t("increasedVsLastWeek")}
        </span>
      </div>
    </div>
  );
}
