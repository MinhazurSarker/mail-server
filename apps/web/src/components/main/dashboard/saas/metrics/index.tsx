"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { saasMetricsData } from "./data";
import MetricItem from "./metric-item";
import MetricsGrid from "./metrics-grid";
import MetricsHeader from "./metrics-header";
import type { SaasMetricsProps, Timeframe } from "./types";

export default function SaasMetrics({
  initialTimeframe = "weekly",
  timeframe: controlledTimeframe,
  onTimeframeChange: setControlledTimeframe,
  data = saasMetricsData,
  onFilterClick,
  className,
  children,
}: SaasMetricsProps) {
  const t = useTranslations("saas.metrics");
  const [internalTimeframe, setInternalTimeframe] =
    useState<Timeframe>(initialTimeframe);

  const activeTimeframe = controlledTimeframe ?? internalTimeframe;
  const handleTimeframeChange = (tf: Timeframe) => {
    if (setControlledTimeframe) {
      setControlledTimeframe(tf);
    } else {
      setInternalTimeframe(tf);
    }
  };

  const currentMetrics = data[activeTimeframe] ?? data.weekly;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {children ? (
        children
      ) : (
        <>
          <MetricsHeader
            timeframe={activeTimeframe}
            onTimeframeChange={handleTimeframeChange}
            onFilterClick={onFilterClick}
          />

          <MetricsGrid>
            {currentMetrics.map((item) => (
              <MetricItem
                key={item.id}
                title={t(item.titleKey)}
                value={item.value}
                change={item.change}
                direction={item.direction}
              />
            ))}
          </MetricsGrid>
        </>
      )}
    </div>
  );
}
