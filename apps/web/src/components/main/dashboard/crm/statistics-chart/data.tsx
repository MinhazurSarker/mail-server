export type StatisticTab = "monthly" | "quarterly" | "annually";

export const statisticTabs: StatisticTab[] = [
  "monthly",
  "quarterly",
  "annually",
];

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

export interface StatisticMetricItem {
  value: string;
  change: string;
  direction: "up" | "down";
}

export interface TabMetrics {
  primary: StatisticMetricItem;
  secondary: StatisticMetricItem;
}

export const crmStatisticsMetrics: Record<StatisticTab, TabMetrics> = {
  monthly: {
    primary: {
      value: "$212,142.12",
      change: "+23.2%",
      direction: "up",
    },
    secondary: {
      value: "$30,321.23",
      change: "-12.3%",
      direction: "down",
    },
  },
  quarterly: {
    primary: {
      value: "$534,210.00",
      change: "+18.5%",
      direction: "up",
    },
    secondary: {
      value: "$82,410.50",
      change: "+5.2%",
      direction: "down",
    },
  },
  annually: {
    primary: {
      value: "$2,142,500.00",
      change: "+26.4%",
      direction: "up",
    },
    secondary: {
      value: "$340,120.00",
      change: "+8.1%",
      direction: "down",
    },
  },
};

const crmSeriesByTab = {
  monthly: {
    sales: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    revenue: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
  },
  quarterly: {
    categories: ["Q1", "Q2", "Q3", "Q4"],
    sales: [540, 510, 605, 685],
    revenue: [120, 135, 280, 410],
  },
  annually: {
    categories: ["2021", "2022", "2023", "2024", "2025"],
    sales: [1850, 2050, 2140, 2320, 2450],
    revenue: [620, 750, 890, 1020, 1150],
  },
};

export const getCrmStatisticsData = (
  tab: StatisticTab,
  t: (key: string) => string,
  tMonths: (key: string) => string,
) => {
  let categories: string[];
  let salesData: number[];
  let revenueData: number[];

  if (tab === "monthly") {
    categories = monthKeys.map((key) => tMonths(key));
    salesData = crmSeriesByTab.monthly.sales;
    revenueData = crmSeriesByTab.monthly.revenue;
  } else if (tab === "quarterly") {
    categories = crmSeriesByTab.quarterly.categories;
    salesData = crmSeriesByTab.quarterly.sales;
    revenueData = crmSeriesByTab.quarterly.revenue;
  } else {
    categories = crmSeriesByTab.annually.categories;
    salesData = crmSeriesByTab.annually.sales;
    revenueData = crmSeriesByTab.annually.revenue;
  }

  const series = [
    {
      name: t("sales"),
      data: salesData,
    },
    {
      name: t("revenue"),
      data: revenueData,
    },
  ];

  return { categories, series };
};
