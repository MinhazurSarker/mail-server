"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import RevenueChart from "./revenue-chart";

export default function RevenueStat() {
  const t = useTranslations("logistics.revenueEarned");

  return (
    <Card className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("shippedQuantities")}
          </p>
          <h3 className="text-3xl font-medium text-gray-800 dark:text-white/90">
            9,258
          </h3>
        </div>

        <RevenueChart />
      </div>
    </Card>
  );
}
