"use client";

import { useTranslations } from "next-intl";
import { marketingMetricsData } from "./data";
import MetricCard from "./metric-card";

export default function MarketingMetrics() {
  const t = useTranslations("marketing.metrics");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {marketingMetricsData.map((item) => (
        <MetricCard
          key={item.id}
          icon={item.icon}
          title={t(item.titleKey)}
          value={item.value}
          change={item.change}
          direction={item.direction}
          comparisonText={t("vsLastMonth")}
        />
      ))}
    </div>
  );
}

export { MarketingMetrics as MarketingMetricsCards };
