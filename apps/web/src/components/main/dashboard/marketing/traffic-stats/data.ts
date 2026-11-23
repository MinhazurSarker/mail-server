import { StatMetric, TrafficPeriod, TrafficTabItem } from "./types";

export const trafficTabs: TrafficTabItem[] = [
  { id: "today", labelKey: "today" },
  { id: "week", labelKey: "week" },
  { id: "month", labelKey: "month" },
];

export const trafficStatsData: Record<TrafficPeriod, StatMetric[]> = {
  today: [
    {
      id: "subscribers",
      labelKey: "newSubscribers",
      value: "1,248",
      change: "+2.40%",
      comparisonKey: "thanYesterday",
      isPositive: true,
      chartData: [15, 18, 16, 22, 24, 20, 28, 35, 32, 38, 36, 42],
    },
    {
      id: "conversion",
      labelKey: "conversionRate",
      value: "4.8%",
      change: "-0.85%",
      comparisonKey: "thanYesterday",
      isPositive: false,
      chartData: [42, 39, 36, 34, 30, 28, 26, 24, 22, 25, 21, 19],
    },
    {
      id: "bounce",
      labelKey: "pageBounceRate",
      value: "32.4%",
      change: "+1.15%",
      comparisonKey: "thanYesterday",
      isPositive: true,
      chartData: [18, 20, 22, 21, 26, 28, 25, 30, 34, 32, 36, 38],
    },
  ],
  week: [
    {
      id: "subscribers",
      labelKey: "newSubscribers",
      value: "567K",
      change: "+3.85%",
      comparisonKey: "thenLastWeek",
      isPositive: true,
      chartData: [20, 25, 23, 28, 30, 26, 35, 42, 38, 45, 41, 44],
    },
    {
      id: "conversion",
      labelKey: "conversionRate",
      value: "276K",
      change: "-5.39%",
      comparisonKey: "thenLastWeek",
      isPositive: false,
      chartData: [45, 44, 40, 32, 28, 30, 22, 26, 20, 25, 22, 23],
    },
    {
      id: "bounce",
      labelKey: "pageBounceRate",
      value: "285",
      change: "12.74%",
      comparisonKey: "thenLastWeek",
      isPositive: true,
      chartData: [18, 22, 20, 25, 28, 24, 32, 40, 36, 42, 39, 41],
    },
  ],
  month: [
    {
      id: "subscribers",
      labelKey: "newSubscribers",
      value: "2.4M",
      change: "+8.60%",
      comparisonKey: "thanLastMonth",
      isPositive: true,
      chartData: [25, 28, 30, 35, 38, 42, 45, 52, 58, 62, 68, 75],
    },
    {
      id: "conversion",
      labelKey: "conversionRate",
      value: "1.1M",
      change: "+4.12%",
      comparisonKey: "thanLastMonth",
      isPositive: true,
      chartData: [15, 18, 22, 25, 28, 30, 35, 40, 42, 46, 50, 55],
    },
    {
      id: "bounce",
      labelKey: "pageBounceRate",
      value: "1.2K",
      change: "-3.45%",
      comparisonKey: "thanLastMonth",
      isPositive: false,
      chartData: [55, 52, 48, 45, 42, 40, 38, 35, 32, 30, 28, 25],
    },
  ],
};
