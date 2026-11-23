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

export const aiSeriesByTab = {
  monthly: {
    users: [
      18000, 21000, 23000, 22000, 17000, 21000, 28000, 26000, 24000, 42000,
      57000, 53000,
    ],
    revenue: [
      24000, 28000, 34000, 35000, 41000, 38000, 34000, 34000, 35000, 39000,
      44000, 39000,
    ],
  },
  quarterly: {
    categories: ["Q1", "Q2", "Q3", "Q4"],
    users: [62000, 66000, 78000, 152000],
    revenue: [86000, 114000, 103000, 122000],
  },
  annually: {
    categories: ["2021", "2022", "2023", "2024", "2025"],
    users: [180000, 220000, 270000, 310000, 358000],
    revenue: [240000, 290000, 360000, 410000, 425000],
  },
};

export const getAiStatisticsData = (
  tab: StatisticTab,
  t: (key: string) => string,
  tMonths: (key: string) => string,
) => {
  let categories: string[];
  let usersData: number[];
  let revenueData: number[];

  if (tab === "monthly") {
    categories = monthKeys.map((key) => tMonths(key));
    usersData = aiSeriesByTab.monthly.users;
    revenueData = aiSeriesByTab.monthly.revenue;
  } else if (tab === "quarterly") {
    categories = aiSeriesByTab.quarterly.categories;
    usersData = aiSeriesByTab.quarterly.users;
    revenueData = aiSeriesByTab.quarterly.revenue;
  } else {
    categories = aiSeriesByTab.annually.categories;
    usersData = aiSeriesByTab.annually.users;
    revenueData = aiSeriesByTab.annually.revenue;
  }

  const series = [
    {
      name: t("users"),
      data: usersData,
    },
    {
      name: t("revenue"),
      data: revenueData,
    },
  ];

  return { categories, series };
};
