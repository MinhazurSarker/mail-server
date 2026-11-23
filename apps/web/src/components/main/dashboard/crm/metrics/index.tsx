"use client";

import { useTranslations } from "next-intl";
import { crmMetricsData } from "./data";
import MetricCard from "./metric-card";

export default function CrmMetrics() {
  const t = useTranslations("crm.metrics");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {crmMetricsData.map((item) => (
        <MetricCard
          key={item.id}
          title={t(item.titleKey)}
          value={item.value}
          change={item.change}
          direction={item.direction}
          comparisonText={t(item.comparisonKey ?? "lastMonth")}
        />
      ))}
    </div>
  );
}
