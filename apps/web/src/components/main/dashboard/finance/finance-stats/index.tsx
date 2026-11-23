"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { financeStatsData } from "./data";
import StatCard from "./stat-card";
import { FinanceStatsProps } from "./types";

export default function FinanceStats({
  className,
  data = financeStatsData,
}: FinanceStatsProps) {
  const t = useTranslations("finance.stats");

  return (
    <div
      className={cn(
        "h-full rounded-[18px] border border-gray-200 bg-gray-100 p-1.5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="grid h-full grid-cols-1 gap-1.5 sm:grid-cols-2">
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
            badge={item.badge}
          />
        ))}
      </div>
    </div>
  );
}

export { StatCard };
export type { FinanceStatsProps };
