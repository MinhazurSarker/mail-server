import { MetricsDataMap } from "./types";

export const saasMetricsData: MetricsDataMap = {
  weekly: [
    {
      id: "revenue",
      titleKey: "totalRevenue",
      value: "$200,425.87",
      change: "+ 2.5%",
      direction: "up",
    },
    {
      id: "users",
      titleKey: "activeUsers",
      value: "9,528",
      change: "+ 9.5%",
      direction: "up",
    },
    {
      id: "clv",
      titleKey: "clv",
      value: "$849.54",
      change: "- 1.6%",
      direction: "down",
    },
    {
      id: "cac",
      titleKey: "cac",
      value: "9,528",
      change: "+ 3.5%",
      direction: "up",
    },
  ],
  monthly: [
    {
      id: "revenue",
      titleKey: "totalRevenue",
      value: "$845,630.00",
      change: "+ 8.2%",
      direction: "up",
    },
    {
      id: "users",
      titleKey: "activeUsers",
      value: "38,420",
      change: "+ 12.4%",
      direction: "up",
    },
    {
      id: "clv",
      titleKey: "clv",
      value: "$890.15",
      change: "+ 3.8%",
      direction: "up",
    },
    {
      id: "cac",
      titleKey: "cac",
      value: "8,410",
      change: "- 2.1%",
      direction: "down",
    },
  ],
  yearly: [
    {
      id: "revenue",
      titleKey: "totalRevenue",
      value: "$9,842,500.00",
      change: "+ 24.5%",
      direction: "up",
    },
    {
      id: "users",
      titleKey: "activeUsers",
      value: "420,500",
      change: "+ 35.0%",
      direction: "up",
    },
    {
      id: "clv",
      titleKey: "clv",
      value: "$1,240.50",
      change: "+ 15.3%",
      direction: "up",
    },
    {
      id: "cac",
      titleKey: "cac",
      value: "7,200",
      change: "- 8.4%",
      direction: "down",
    },
  ],
};
