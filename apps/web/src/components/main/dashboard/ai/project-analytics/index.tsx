"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import { projectAnalyticsMetricsData } from "./data";
import MetricCard from "./metric-card";
import SummaryMetric from "./summary-metric";
import { ProjectAnalyticsProps } from "./types";

const gridCornerClasses = [
  "rounded-t-xl sm:rounded-none sm:rounded-ss-xl",
  "sm:rounded-none sm:rounded-se-xl",
  "sm:rounded-none sm:rounded-es-xl",
  "rounded-b-xl sm:rounded-none sm:rounded-ee-xl",
];

export default function ProjectAnalytics({
  className,
  data = projectAnalyticsMetricsData,
  totalProjects = "15,682",
}: ProjectAnalyticsProps) {
  const t = useTranslations("aiDashboard.projectAnalytics");

  return (
    <Card
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader />

      <SummaryMetric title={t("totalProjects")} value={totalProjects} />

      <div className="grid grid-cols-1 gap-1 rounded-2xl bg-gray-100 p-1 sm:grid-cols-2 dark:bg-white/3">
        {data.map((item, index) => (
          <MetricCard
            key={item.id}
            title={t(item.titleKey)}
            value={item.value}
            icon={item.icon}
            change={item.change}
            comparisonText={
              item.comparisonKey ? t(item.comparisonKey) : undefined
            }
            isPositive={item.isPositive}
            className={gridCornerClasses[index % 4]}
          />
        ))}
      </div>
    </Card>
  );
}
