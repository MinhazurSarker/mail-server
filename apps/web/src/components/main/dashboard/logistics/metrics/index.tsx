"use client";

import { useTranslations } from "next-intl";
import { logisticsMetricsData } from "./data";
import MetricCard from "./metric-card";

export default function LogisticsMetrics() {
  const t = useTranslations("logistics.metrics");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {logisticsMetricsData.map((item) => (
        <MetricCard
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
