export type TrafficPeriod = "today" | "week" | "month";

export interface TrafficTabItem {
  id: TrafficPeriod;
  labelKey: "today" | "week" | "month";
}

export interface StatMetric {
  id: string;
  labelKey: "newSubscribers" | "conversionRate" | "pageBounceRate";
  value: string;
  change: string;
  comparisonKey: "thanYesterday" | "thenLastWeek" | "thanLastMonth";
  isPositive: boolean;
  chartData: number[];
}
