import { RevenueTab } from "./types";

export const revenueTabs: RevenueTab[] = ["daily", "weekly", "monthly"];

export const monthKeys = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

export const revenueSeriesByTab = {
  daily: {
    categories: [
      "00:00",
      "01:00",
      "02:00",
      "04:00",
      "05:00",
      "06:00",
      "07:00",
      "08:00",
    ],
    online: [16500, 17500, 19800, 15600, 22400, 20100, 37200, 35400],
    offline: [19200, 23100, 28400, 29800, 25200, 24800, 31500, 28100],
    maxY: 40000,
    tickAmount: 4,
  },
  weekly: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    online: [18500, 22400, 21200, 26800, 24500, 31200, 33500],
    offline: [14200, 16800, 19400, 22100, 20800, 25400, 27600],
    maxY: 40000,
    tickAmount: 4,
  },
  monthly: {
    online: [
      13000, 13800, 13200, 14200, 13900, 15240, 15600, 17000, 16500, 17500,
      17200, 18000,
    ],
    offline: [
      8500, 9200, 8800, 9800, 9400, 10490, 10800, 11500, 10800, 11800, 11200,
      11800,
    ],
    maxY: 20000,
    tickAmount: 4,
  },
};

export const getRevenueChartData = (
  tab: RevenueTab,
  t: (key: string) => string,
  tMonths: (key: (typeof monthKeys)[number]) => string,
) => {
  let categories: string[];
  let onlineData: number[];
  let offlineData: number[];
  let maxY: number;
  let tickAmount: number;

  if (tab === "daily") {
    categories = revenueSeriesByTab.daily.categories;
    onlineData = revenueSeriesByTab.daily.online;
    offlineData = revenueSeriesByTab.daily.offline;
    maxY = revenueSeriesByTab.daily.maxY;
    tickAmount = revenueSeriesByTab.daily.tickAmount;
  } else if (tab === "weekly") {
    categories = revenueSeriesByTab.weekly.categories;
    onlineData = revenueSeriesByTab.weekly.online;
    offlineData = revenueSeriesByTab.weekly.offline;
    maxY = revenueSeriesByTab.weekly.maxY;
    tickAmount = revenueSeriesByTab.weekly.tickAmount;
  } else {
    categories = monthKeys.map((key) => tMonths(key));
    onlineData = revenueSeriesByTab.monthly.online;
    offlineData = revenueSeriesByTab.monthly.offline;
    maxY = revenueSeriesByTab.monthly.maxY;
    tickAmount = revenueSeriesByTab.monthly.tickAmount;
  }

  const series = [
    {
      name: t("online"),
      data: onlineData,
    },
    {
      name: t("offline"),
      data: offlineData,
    },
  ];

  return { categories, series, maxY, tickAmount };
};
