"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import { salesStatsData } from "./data";
import StatCard from "./stat-card";
import { StatItem } from "./types";

export interface SalesStatsProps {
  className?: string;
  data?: StatItem[];
}

export default function SalesStats({
  className,
  data = salesStatsData,
}: SalesStatsProps) {
  const t = useTranslations("sales.salesStats");

  return (
    <Card
      className={cn(
        "col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader />

      <div className="rounded-2xl bg-gray-100 p-1 dark:bg-white/3">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4">
          {data.map((item) => (
            <StatCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              value={item.value}
              change={item.change}
              direction={item.direction}
              comparisonText={
                item.comparisonKey ? t(item.comparisonKey) : undefined
              }
              chartColor={item.chartColor}
              seriesName={t("newSales")}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
