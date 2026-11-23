"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import CardHeader from "./card-header";
import { performanceData } from "./data";
import PerformanceTabs from "./performance-tabs";
import ProductMetrics from "./product-metrics";
import SalesChartCard from "./sales-chart-card";
import { PerformanceTab } from "./types";

export default function PerformanceMetrics() {
  const [selectedTab, setSelectedTab] = useState<PerformanceTab>("daily");
  const currentData = performanceData[selectedTab];

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <PerformanceTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />

      <div className="mt-0.5 space-y-4">
        <ProductMetrics
          digitalProduct={currentData.digitalProduct}
          physicalProduct={currentData.physicalProduct}
        />
        <SalesChartCard data={currentData} />
      </div>
    </Card>
  );
}
