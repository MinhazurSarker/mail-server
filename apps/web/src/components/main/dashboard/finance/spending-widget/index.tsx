"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import {
  spendingCategories,
  spendingData,
  TimeframeOption,
  timeframes,
} from "./data";
import SpendingCategories from "./spending-categories";
import SpendingChart from "./spending-chart";

export default function SpendingWidget() {
  const t = useTranslations("finance.spending");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    timeframes[0],
  );

  const currentDataset = useMemo(() => {
    return spendingData[selectedTimeframe];
  }, [selectedTimeframe]);

  const series = useMemo(() => {
    const categoryMap = new Map(spendingCategories.map((c) => [c.id, c]));
    return currentDataset.series.map((item) => {
      const category = categoryMap.get(item.id);
      const nameKey = category ? category.nameKey : item.id;
      return {
        name: t(`categories.${nameKey}`),
        data: [item.value],
      };
    });
  }, [currentDataset, t]);

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
      />

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <p className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">
            {t("total")}
          </p>
          <h4 className="text-3xl leading-10 font-medium text-gray-800 dark:text-white/90">
            {currentDataset.total}
          </h4>
        </div>

        <SpendingChart series={series} />

        <SpendingCategories />
      </div>
    </Card>
  );
}
