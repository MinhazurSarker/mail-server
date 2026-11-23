"use client";

import { useTranslations } from "next-intl";
import { deliveryIndicators } from "./data";

export default function ChartIndicators() {
  const t = useTranslations("logistics.deliveryStatistics");

  return (
    <div className="flex flex-wrap items-center gap-5 sm:gap-6">
      {deliveryIndicators.map((indicator) => (
        <div key={indicator.id} className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: indicator.color }}
          />
          <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
            {t(indicator.labelKey)}
          </span>
        </div>
      ))}
    </div>
  );
}
