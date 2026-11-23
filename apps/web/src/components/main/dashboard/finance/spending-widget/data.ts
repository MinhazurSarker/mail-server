import { ApexOptions } from "apexcharts";

export const timeframes = ["Yearly", "Monthly"] as const;
export type TimeframeOption = (typeof timeframes)[number];

export interface SpendingCategory {
  id: string;
  nameKey:
    | "activity"
    | "onlinePurchases"
    | "groceries"
    | "digitalGoods"
    | "stationery"
    | "others";
  color: string;
}

export const spendingCategories: SpendingCategory[] = [
  { id: "activity", nameKey: "activity", color: "#7592FF" },
  { id: "onlinePurchases", nameKey: "onlinePurchases", color: "#7CD4FD" },
  { id: "groceries", nameKey: "groceries", color: "#BDB4FE" },
  { id: "digitalGoods", nameKey: "digitalGoods", color: "#FE9EFE" },
  { id: "stationery", nameKey: "stationery", color: "#6FEAA6" },
  { id: "others", nameKey: "others", color: "#D0D5DD" },
];

export interface SpendingDataset {
  total: string;
  series: {
    id: string;
    value: number;
  }[];
}

export const spendingData: Record<TimeframeOption, SpendingDataset> = {
  Yearly: {
    total: "$10,758",
    series: [
      { id: "activity", value: 45 },
      { id: "onlinePurchases", value: 25 },
      { id: "groceries", value: 15 },
      { id: "digitalGoods", value: 20 },
      { id: "stationery", value: 10 },
      { id: "others", value: 30 },
    ],
  },
  Monthly: {
    total: "$1,248",
    series: [
      { id: "activity", value: 38 },
      { id: "onlinePurchases", value: 22 },
      { id: "groceries", value: 18 },
      { id: "digitalGoods", value: 14 },
      { id: "stationery", value: 8 },
      { id: "others", value: 20 },
    ],
  },
};

export interface SpendingChartOptionsParams {
  theme?: string;
  colors?: string[];
}

export function getSpendingChartOptions({
  theme,
  colors,
}: SpendingChartOptionsParams = {}): ApexOptions {
  return {
    colors: colors ?? spendingCategories.map((c) => c.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 50,
      width: "100%",
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "32px",
        borderRadius: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
      padding: {
        top: -30,
        bottom: -20,
        left: -10,
        right: 0,
      },
    },
    xaxis: {
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: theme === "dark" ? "dark" : "light",
      x: {
        show: false,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: [theme === "dark" ? "#111827" : "#FFFFFF"],
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
      active: {
        filter: {
          type: "none",
        },
      },
    },
  };
}
