"use client";

import { useTranslations } from "next-intl";
import { conversionIndicators } from "./data";

export default function ChartIndicators() {
  const t = useTranslations("saas.conversionFunnel");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {conversionIndicators.map((indicator) => (
          <div key={indicator.id} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: indicator.color }}
            />
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {t(`series.${indicator.labelKey}`)}
            </span>
          </div>
        ))}
      </div>

      <div className="text-base font-medium text-gray-800 dark:text-white/90">
        {t("total")}
      </div>
    </div>
  );
}
