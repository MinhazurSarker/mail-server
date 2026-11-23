"use client";

import { useTranslations } from "next-intl";

export default function ChartLegend() {
  const t = useTranslations("aiDashboard.userRevenue");

  return (
    <div className="mt-6 mb-2 flex items-center gap-5">
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-brand-500" />
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {t("users")}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-[#00BCFF]" />
        <span className="text-sm text-gray-700 dark:text-gray-400">
          {t("revenue")}
        </span>
      </div>
    </div>
  );
}
