import { PerformanceMetricData, PerformanceTab, PerformanceTabItem } from "./types";

export const performanceTabs: PerformanceTabItem[] = [
  { id: "daily", labelKey: "tabs.dailySales" },
  { id: "online", labelKey: "tabs.onlineSales" },
  { id: "new", labelKey: "tabs.newUsers" },
];

export const performanceData: Record<PerformanceTab, PerformanceMetricData> = {
  daily: {
    digitalProduct: {
      value: "790",
      isPositive: true,
    },
    physicalProduct: {
      value: "572",
      isPositive: false,
    },
    mainStat: {
      titleKey: "avgDailySales",
      value: "$2,950",
      change: "0.52%",
      isPositive: false,
    },
    chartData: [2.3, 3.1, 2.7, 3.9, 2.1, 1.7, 1.7],
    categories: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  online: {
    digitalProduct: {
      value: "8,490",
      isPositive: true,
    },
    physicalProduct: {
      value: "950",
      isPositive: false,
    },
    mainStat: {
      titleKey: "totalOnlineSales",
      value: "$59,410",
      change: "0.52%",
      isPositive: true,
    },
    chartData: [3.2, 4.0, 3.5, 5.2, 4.1, 2.8, 3.6],
    categories: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  new: {
    digitalProduct: {
      value: "1,240",
      isPositive: true,
    },
    physicalProduct: {
      value: "680",
      isPositive: true,
    },
    mainStat: {
      titleKey: "totalNewUsers",
      value: "5.9K",
      change: "1.45%",
      isPositive: true,
    },
    chartData: [1.8, 2.4, 3.1, 4.5, 3.2, 2.9, 3.4],
    categories: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  },
};
