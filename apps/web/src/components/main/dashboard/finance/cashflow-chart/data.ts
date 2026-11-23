import { ApexOptions } from "apexcharts";

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

export type MonthKey = (typeof monthKeys)[number];

export const years = ["2028", "2027", "2026", "2025", "2024"] as const;
export type YearOption = (typeof years)[number];

export const timeframes = [
  "12 Months",
  "6 Months",
  "3 Months",
  "30 Days",
] as const;
export type TimeframeOption = (typeof timeframes)[number];

export interface CashflowIndicator {
  id: "income" | "expense";
  labelKey: "income" | "expense";
  color: string;
}

export const cashflowIndicators: CashflowIndicator[] = [
  { id: "income", labelKey: "income", color: "#465FFF" },
  { id: "expense", labelKey: "expense", color: "#7CD4FD" },
];

export interface CashflowDataset {
  revenue: string;
  growth: string;
  isPositive: boolean;
  categories: string[];
  isMonthKeys?: boolean;
  expense: number[];
  income: number[];
}

export const cashflowData: Record<
  YearOption,
  Record<TimeframeOption, CashflowDataset>
> = {
  "2028": {
    "12 Months": {
      revenue: "$9,758.00",
      growth: "+7.96%",
      isPositive: true,
      categories: [
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
      ],
      isMonthKeys: true,
      // Stacked bar heights mirroring Figma node 7681:208825 exactly
      expense: [
        10300, 6400, 3000, 14900, 4300, 6900, 8900, 5200, 6200, 7800, 5400,
        6100,
      ],
      income: [
        9700, 6000, 16300, 4400, 7000, 9700, 9700, 9700, 8500, 11200, 9100,
        10500,
      ],
    },
    "6 Months": {
      revenue: "$5,380.00",
      growth: "+5.42%",
      isPositive: true,
      categories: ["jan", "feb", "mar", "apr", "may", "jun"],
      isMonthKeys: true,
      expense: [10300, 6400, 3000, 14900, 4300, 6900],
      income: [9700, 6000, 16300, 4400, 7000, 9700],
    },
    "3 Months": {
      revenue: "$2,890.00",
      growth: "+3.15%",
      isPositive: true,
      categories: ["jan", "feb", "mar"],
      isMonthKeys: true,
      expense: [10300, 6400, 3000],
      income: [9700, 6000, 16300],
    },
    "30 Days": {
      revenue: "$1,150.00",
      growth: "+2.80%",
      isPositive: true,
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      isMonthKeys: false,
      expense: [2400, 1800, 3100, 2200],
      income: [3200, 2900, 3800, 2700],
    },
  },
  "2027": {
    "12 Months": {
      revenue: "$8,940.00",
      growth: "+6.12%",
      isPositive: true,
      categories: [
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
      ],
      isMonthKeys: true,
      expense: [
        9100, 5800, 4200, 13100, 3900, 6100, 7800, 4900, 5800, 7100, 4900, 5600,
      ],
      income: [
        8800, 5400, 14200, 4100, 6200, 8900, 8700, 8900, 7900, 10100, 8200,
        9400,
      ],
    },
    "6 Months": {
      revenue: "$4,850.00",
      growth: "+4.90%",
      isPositive: true,
      categories: ["jan", "feb", "mar", "apr", "may", "jun"],
      isMonthKeys: true,
      expense: [9100, 5800, 4200, 13100, 3900, 6100],
      income: [8800, 5400, 14200, 4100, 6200, 8900],
    },
    "3 Months": {
      revenue: "$2,480.00",
      growth: "+2.75%",
      isPositive: true,
      categories: ["jan", "feb", "mar"],
      isMonthKeys: true,
      expense: [9100, 5800, 4200],
      income: [8800, 5400, 14200],
    },
    "30 Days": {
      revenue: "$980.00",
      growth: "+1.95%",
      isPositive: true,
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      isMonthKeys: false,
      expense: [2100, 1600, 2700, 1900],
      income: [2800, 2600, 3400, 2400],
    },
  },
  "2026": {
    "12 Months": {
      revenue: "$7,820.00",
      growth: "+4.35%",
      isPositive: true,
      categories: [
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
      ],
      isMonthKeys: true,
      expense: [
        8200, 5100, 3800, 11500, 3600, 5500, 6900, 4400, 5200, 6400, 4400, 5000,
      ],
      income: [
        7900, 4800, 12800, 3600, 5500, 7900, 7800, 7900, 7100, 9100, 7400, 8400,
      ],
    },
    "6 Months": {
      revenue: "$4,210.00",
      growth: "+3.85%",
      isPositive: true,
      categories: ["jan", "feb", "mar", "apr", "may", "jun"],
      isMonthKeys: true,
      expense: [8200, 5100, 3800, 11500, 3600, 5500],
      income: [7900, 4800, 12800, 3600, 5500, 7900],
    },
    "3 Months": {
      revenue: "$2,150.00",
      growth: "+2.10%",
      isPositive: true,
      categories: ["jan", "feb", "mar"],
      isMonthKeys: true,
      expense: [8200, 5100, 3800],
      income: [7900, 4800, 12800],
    },
    "30 Days": {
      revenue: "$860.00",
      growth: "+1.40%",
      isPositive: true,
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      isMonthKeys: false,
      expense: [1900, 1400, 2400, 1700],
      income: [2500, 2300, 3000, 2100],
    },
  },
  "2025": {
    "12 Months": {
      revenue: "$6,450.00",
      growth: "-2.14%",
      isPositive: false,
      categories: [
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
      ],
      isMonthKeys: true,
      expense: [
        7500, 4800, 3500, 10200, 3200, 4900, 6200, 3900, 4700, 5800, 3900, 4500,
      ],
      income: [
        7100, 4300, 11400, 3200, 4900, 7000, 6900, 7000, 6300, 8100, 6600, 7500,
      ],
    },
    "6 Months": {
      revenue: "$3,480.00",
      growth: "-1.80%",
      isPositive: false,
      categories: ["jan", "feb", "mar", "apr", "may", "jun"],
      isMonthKeys: true,
      expense: [7500, 4800, 3500, 10200, 3200, 4900],
      income: [7100, 4300, 11400, 3200, 4900, 7000],
    },
    "3 Months": {
      revenue: "$1,820.00",
      growth: "-0.95%",
      isPositive: false,
      categories: ["jan", "feb", "mar"],
      isMonthKeys: true,
      expense: [7500, 4800, 3500],
      income: [7100, 4300, 11400],
    },
    "30 Days": {
      revenue: "$740.00",
      growth: "-0.65%",
      isPositive: false,
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      isMonthKeys: false,
      expense: [1700, 1300, 2100, 1500],
      income: [2200, 2000, 2700, 1900],
    },
  },
  "2024": {
    "12 Months": {
      revenue: "$5,610.00",
      growth: "+1.85%",
      isPositive: true,
      categories: [
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
      ],
      isMonthKeys: true,
      expense: [
        6800, 4300, 3100, 9200, 2900, 4400, 5600, 3500, 4200, 5200, 3500, 4000,
      ],
      income: [
        6400, 3900, 10200, 2900, 4400, 6300, 6200, 6300, 5700, 7300, 5900, 6700,
      ],
    },
    "6 Months": {
      revenue: "$3,040.00",
      growth: "+1.50%",
      isPositive: true,
      categories: ["jan", "feb", "mar", "apr", "may", "jun"],
      isMonthKeys: true,
      expense: [6800, 4300, 3100, 9200, 2900, 4400],
      income: [6400, 3900, 10200, 2900, 4400, 6300],
    },
    "3 Months": {
      revenue: "$1,590.00",
      growth: "+0.85%",
      isPositive: true,
      categories: ["jan", "feb", "mar"],
      isMonthKeys: true,
      expense: [6800, 4300, 3100],
      income: [6400, 3900, 10200],
    },
    "30 Days": {
      revenue: "$650.00",
      growth: "+0.50%",
      isPositive: true,
      categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
      isMonthKeys: false,
      expense: [1500, 1100, 1900, 1300],
      income: [2000, 1800, 2400, 1700],
    },
  },
};

export const SERIES_COLORS = {
  expense: "#7CD4FD",
  income: "#7592FF",
} as const;

export interface CashflowChartOptionsParams {
  categories?: string[];
  theme?: string;
  colors?: string[];
}

export function getCashflowChartOptions(
  params: CashflowChartOptionsParams,
): ApexOptions;
export function getCashflowChartOptions(
  categories?: string[],
  theme?: string,
  colors?: string[],
): ApexOptions;
export function getCashflowChartOptions(
  categoriesOrParams: string[] | CashflowChartOptionsParams = [],
  theme?: string,
  colors?: string[],
): ApexOptions {
  const isParamsObject =
    !Array.isArray(categoriesOrParams) &&
    typeof categoriesOrParams === "object";

  const resolvedCategories = isParamsObject
    ? (categoriesOrParams.categories ?? [])
    : categoriesOrParams;
  const resolvedTheme = isParamsObject ? categoriesOrParams.theme : theme;
  const resolvedColors = isParamsObject ? categoriesOrParams.colors : colors;

  return {
    colors: resolvedColors ?? [SERIES_COLORS.expense, SERIES_COLORS.income],
    chart: {
      type: "bar",
      height: 220,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: resolvedCategories,
      tickPlacement: "on",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        show: true,
        width: 38,
        position: "back",
        opacity: 1,
        stroke: {
          width: 0,
        },
        fill: {
          type: "solid",
          color:
            resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
        },
      },
      labels: {
        style: {
          colors: resolvedTheme === "dark" ? "#94A3B8" : "#6B7280",
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 26000,
      tickAmount: 5,
      labels: {
        style: {
          colors: resolvedTheme === "dark" ? "#94A3B8" : "#6B7280",
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
        },
        formatter: (value: number) => {
          if (value >= 1000) return `${Math.round(value / 1000)}K`;
          return value.toString();
        },
      },
    },
    grid: {
      position: "back",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: resolvedTheme === "dark" ? "#1E2939" : "#F3F4F6",
      strokeDashArray: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      followCursor: true,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number) => `$${value?.toLocaleString?.() ?? value}`,
      },
    },
  };
}

export const cashflowChartOptions = getCashflowChartOptions;
