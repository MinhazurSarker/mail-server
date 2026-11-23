"use client";

import { useState } from "react";
import CardHeader from "./card-header";
import { trafficStatsData } from "./data";
import StatItem from "./stat-item";
import TrafficTabs from "./traffic-tabs";
import { TrafficPeriod } from "./types";

export default function TrafficStats() {
  const [selectedPeriod, setSelectedPeriod] = useState<TrafficPeriod>("today");
  const metrics = trafficStatsData[selectedPeriod];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="mt-6">
        <TrafficTabs
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </div>

      <div className="mt-1">
        {metrics.map((metric, index) => (
          <StatItem
            key={metric.id}
            metric={metric}
            isLast={index === metrics.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
