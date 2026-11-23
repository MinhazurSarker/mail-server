"use client";

import { useTranslations } from "next-intl";
import { aiStatsData } from "./data";
import StatCard from "./stat-card";

export default function AiStats() {
  const t = useTranslations("aiDashboard.stats");

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {aiStatsData.map((item) => (
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
        />
      ))}
    </div>
  );
}
