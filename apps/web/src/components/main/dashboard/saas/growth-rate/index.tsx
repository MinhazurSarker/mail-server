"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import GrowthChart from "./growth-chart";

export default function GrowthRate() {
  const t = useTranslations("saas.userGrowth");

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-heading-six font-semibold text-gray-800 dark:text-white/90">
            3,768
          </h4>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-success-600 dark:text-success-500">
              +3.85%
            </span>
            <span>{t("thanLastWeek")}</span>
          </p>
        </div>

        <GrowthChart />
      </div>
    </Card>
  );
}
