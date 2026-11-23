"use client";

import { stockMetricsData } from "./data";
import MetricCard from "./metric-card";

export default function StockMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {stockMetricsData.map((item) => (
        <MetricCard
          key={item.id}
          symbol={item.symbol}
          companyName={item.companyName}
          price={item.price}
          change={item.change}
          direction={item.direction}
          icon={item.icon}
          logoBg={item.logoBg}
        />
      ))}
    </div>
  );
}

export { StockMetrics as StockMetricsCards, StockMetrics as StockMetricsList };
