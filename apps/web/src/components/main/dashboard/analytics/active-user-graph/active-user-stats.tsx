"use client";

import { useTranslations } from "next-intl";

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div>
      <p className="text-center text-lg font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
      <p className="mt-0.5 text-center text-xs text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  );
}

interface ActiveUserStatsProps {
  daily?: string;
  weekly?: string;
  monthly?: string;
}

export default function ActiveUserStats({
  daily = "224",
  weekly = "1.4K",
  monthly = "22.1K",
}: ActiveUserStatsProps) {
  const t = useTranslations("analytics.activeUsers");

  return (
    <div className="flex items-center justify-center gap-6">
      <StatItem value={daily} label={t("avgDaily")} />
      <div className="h-11 w-px bg-gray-200 dark:bg-gray-800" />
      <StatItem value={weekly} label={t("avgWeekly")} />
      <div className="h-11 w-px bg-gray-200 dark:bg-gray-800" />
      <StatItem value={monthly} label={t("avgMonthly")} />
    </div>
  );
}
