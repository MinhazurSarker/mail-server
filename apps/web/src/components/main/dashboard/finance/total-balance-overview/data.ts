import { BalanceOverviewData, Currency } from "./types";

export const currencies: Currency[] = [
  { name: "USD", flag: "/images/country/country-01.svg" },
  { name: "EUR", flag: "/images/country/country-02.svg" },
  { name: "GBP", flag: "/images/country/country-03.svg" },
  { name: "JPY", flag: "/images/flag/japan.png" },
];

export const periods: string[] = [
  "June 2025",
  "May 2025",
  "Apr 2025",
  "Q1 2025",
  "Last 30 Days",
  "Last 7 Days",
];

export const balanceOverviewData: Record<
  string,
  Record<string, BalanceOverviewData>
> = {
  USD: {
    "June 2025": {
      amount: "$19,857.00",
      percentage: "3.2%",
      isPositive: true,
      chartData: [
        20, 24, 23, 25, 30, 35, 40, 30, 32, 33, 29, 28, 27, 29, 45, 58, 70, 80,
        72, 68, 85, 79, 77, 75,
      ],
      accountNumber: "•••• •••• •••• 5332",
    },
    "May 2025": {
      amount: "$17,420.00",
      percentage: "1.8%",
      isPositive: false,
      chartData: [
        68, 65, 62, 58, 55, 60, 52, 48, 50, 47, 44, 46, 42, 39, 41, 38, 35, 33,
        30, 32, 28, 26, 25, 20,
      ],
      accountNumber: "•••• •••• •••• 5332",
    },
    "Apr 2025": {
      amount: "$18,950.00",
      percentage: "4.6%",
      isPositive: true,
      chartData: [
        25, 28, 32, 30, 36, 42, 45, 40, 48, 52, 55, 50, 58, 62, 65, 68, 70, 66,
        72, 75, 78, 80, 82, 85,
      ],
      accountNumber: "•••• •••• •••• 5332",
    },
    "Q1 2025": {
      amount: "$54,120.00",
      percentage: "8.1%",
      isPositive: true,
      chartData: [18, 24, 28, 35, 42, 48, 55, 60, 68, 74, 80, 88],
      accountNumber: "•••• •••• •••• 5332",
    },
    "Last 30 Days": {
      amount: "$19,857.00",
      percentage: "0.9%",
      isPositive: false,
      chartData: [
        55, 58, 54, 52, 50, 48, 46, 49, 47, 45, 42, 40, 38, 36, 35, 37, 34, 32,
        30, 28, 26, 25, 24, 22,
      ],
      accountNumber: "•••• •••• •••• 5332",
    },
    "Last 7 Days": {
      amount: "$19,857.00",
      percentage: "2.3%",
      isPositive: true,
      chartData: [30, 35, 32, 45, 42, 50, 58],
      accountNumber: "•••• •••• •••• 5332",
    },
  },
  EUR: {
    "June 2025": {
      amount: "€18,240.50",
      percentage: "2.8%",
      isPositive: true,
      chartData: [
        22, 26, 25, 28, 32, 38, 42, 35, 36, 38, 32, 30, 31, 34, 48, 60, 72, 78,
        74, 70, 82, 77, 75, 73,
      ],
      accountNumber: "•••• •••• •••• 8421",
    },
    "May 2025": {
      amount: "€16,110.00",
      percentage: "2.1%",
      isPositive: false,
      chartData: [
        72, 69, 64, 60, 58, 62, 54, 50, 52, 48, 45, 47, 43, 40, 42, 39, 36, 34,
        31, 33, 29, 27, 24, 22,
      ],
      accountNumber: "•••• •••• •••• 8421",
    },
    "Apr 2025": {
      amount: "€17,450.00",
      percentage: "3.9%",
      isPositive: true,
      chartData: [
        28, 30, 34, 32, 38, 44, 48, 42, 50, 54, 58, 52, 60, 64, 68, 70, 72, 68,
        74, 78, 80, 82, 84, 86,
      ],
      accountNumber: "•••• •••• •••• 8421",
    },
    "Q1 2025": {
      amount: "€49,800.00",
      percentage: "7.4%",
      isPositive: true,
      chartData: [20, 26, 30, 38, 44, 50, 58, 62, 70, 76, 82, 90],
      accountNumber: "•••• •••• •••• 8421",
    },
    "Last 30 Days": {
      amount: "€18,240.50",
      percentage: "1.2%",
      isPositive: false,
      chartData: [
        58, 60, 56, 54, 52, 50, 48, 51, 49, 47, 44, 42, 40, 38, 37, 39, 36, 34,
        32, 30, 28, 27, 25, 23,
      ],
      accountNumber: "•••• •••• •••• 8421",
    },
    "Last 7 Days": {
      amount: "€18,240.50",
      percentage: "1.9%",
      isPositive: true,
      chartData: [32, 38, 34, 48, 44, 52, 60],
      accountNumber: "•••• •••• •••• 8421",
    },
  },
  GBP: {
    "June 2025": {
      amount: "£15,620.00",
      percentage: "3.5%",
      isPositive: true,
      chartData: [
        18, 22, 21, 24, 28, 33, 38, 32, 34, 35, 30, 29, 28, 31, 44, 55, 68, 75,
        70, 66, 80, 76, 74, 72,
      ],
      accountNumber: "•••• •••• •••• 3914",
    },
    "May 2025": {
      amount: "£14,180.00",
      percentage: "1.4%",
      isPositive: false,
      chartData: [
        64, 60, 56, 52, 56, 50, 46, 48, 45, 42, 44, 40, 37, 39, 36, 33, 31, 28,
        30, 26, 24, 22, 20, 18,
      ],
      accountNumber: "•••• •••• •••• 3914",
    },
    "Apr 2025": {
      amount: "£14,920.00",
      percentage: "4.1%",
      isPositive: true,
      chartData: [
        22, 25, 29, 27, 33, 39, 42, 38, 45, 49, 52, 48, 55, 59, 62, 65, 67, 64,
        69, 72, 75, 77, 79, 82,
      ],
      accountNumber: "•••• •••• •••• 3914",
    },
    "Q1 2025": {
      amount: "£42,500.00",
      percentage: "6.8%",
      isPositive: true,
      chartData: [16, 22, 26, 32, 38, 44, 52, 56, 64, 70, 76, 84],
      accountNumber: "•••• •••• •••• 3914",
    },
    "Last 30 Days": {
      amount: "£15,620.00",
      percentage: "0.8%",
      isPositive: false,
      chartData: [
        52, 55, 51, 49, 47, 45, 43, 46, 44, 42, 39, 37, 35, 33, 32, 34, 31, 29,
        27, 25, 23, 22, 21, 19,
      ],
      accountNumber: "•••• •••• •••• 3914",
    },
    "Last 7 Days": {
      amount: "£15,620.00",
      percentage: "2.5%",
      isPositive: true,
      chartData: [28, 32, 30, 42, 40, 48, 55],
      accountNumber: "•••• •••• •••• 3914",
    },
  },
  JPY: {
    "June 2025": {
      amount: "¥2,950,000",
      percentage: "1.7%",
      isPositive: false,
      chartData: [
        60, 58, 55, 52, 54, 49, 46, 47, 44, 42, 43, 40, 38, 39, 36, 34, 32, 30,
        31, 28, 26, 24, 22, 20,
      ],
      accountNumber: "•••• •••• •••• 9062",
    },
    "May 2025": {
      amount: "¥2,680,000",
      percentage: "3.1%",
      isPositive: true,
      chartData: [
        22, 26, 28, 30, 35, 40, 44, 38, 46, 50, 54, 49, 56, 60, 64, 67, 69, 65,
        71, 74, 77, 79, 81, 84,
      ],
      accountNumber: "•••• •••• •••• 9062",
    },
    "Apr 2025": {
      amount: "¥2,490,000",
      percentage: "2.2%",
      isPositive: false,
      chartData: [
        58, 55, 52, 49, 51, 47, 44, 45, 42, 40, 41, 38, 36, 37, 34, 32, 30, 28,
        29, 26, 24, 22, 20, 18,
      ],
      accountNumber: "•••• •••• •••• 9062",
    },
    "Q1 2025": {
      amount: "¥7,820,000",
      percentage: "5.5%",
      isPositive: true,
      chartData: [18, 24, 28, 34, 40, 46, 54, 58, 66, 72, 78, 86],
      accountNumber: "•••• •••• •••• 9062",
    },
    "Last 30 Days": {
      amount: "¥2,950,000",
      percentage: "1.5%",
      isPositive: false,
      chartData: [
        56, 58, 54, 52, 50, 48, 46, 49, 47, 45, 42, 40, 38, 36, 35, 37, 34, 32,
        30, 28, 26, 25, 24, 21,
      ],
      accountNumber: "•••• •••• •••• 9062",
    },
    "Last 7 Days": {
      amount: "¥2,950,000",
      percentage: "3.4%",
      isPositive: true,
      chartData: [26, 31, 29, 40, 38, 46, 54],
      accountNumber: "•••• •••• •••• 9062",
    },
  },
};

export const defaultBalanceOverviewData: BalanceOverviewData = {
  amount: "$19,857.00",
  percentage: "3.2%",
  isPositive: true,
  chartData: [
    20, 24, 23, 25, 30, 35, 40, 30, 32, 33, 29, 28, 27, 29, 45, 58, 70, 80,
    72, 68, 85, 79, 77, 75,
  ],
  accountNumber: "•••• •••• •••• 5332",
};

export function getBalanceOverviewData(
  currency: string,
  period: string,
): BalanceOverviewData {
  return (
    balanceOverviewData[currency]?.[period] ??
    balanceOverviewData[currency]?.["June 2025"] ??
    defaultBalanceOverviewData
  );
}
