"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import ChurnChart from "./churn-chart";

export default function ChurnRate() {
  const t = useTranslations("saas.churnRate");

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="flex items-end justify-between">
        <div>
          <h4 className="text-heading-six font-semibold text-gray-800 dark:text-white/90">
            4.26%
          </h4>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-error-500 dark:text-error-400">
              0.31%
            </span>
            <span>{t("thanLastWeek")}</span>
          </p>
        </div>

        <ChurnChart />
      </div>
    </Card>
  );
}
