export const monthKeys = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
] as const;

export type MonthKey = (typeof monthKeys)[number];

export interface ConversionIndicator {
  id: "adImpression" | "websiteSession" | "newUsers";
  labelKey: "adImpression" | "websiteSession" | "newUsers";
  color: string;
}

export const conversionIndicators: ConversionIndicator[] = [
  { id: "adImpression", labelKey: "adImpression", color: "#7592FF" },
  { id: "websiteSession", labelKey: "websiteSession", color: "#BDB4FE" },
  { id: "newUsers", labelKey: "newUsers", color: "#7CD4FD" },
];

export interface ConversionSeriesData {
  nameKey: "adImpression" | "websiteSession" | "newUsers";
  data: number[];
  color: string;
}

/**
 * Series ordered from bottom to top for ApexCharts stacked column bar chart:
 * 1. New Users (bottom)       - #7CD4FD
 * 2. Website Session (middle) - #BDB4FE
 * 3. Ad Impression (top)      - #7592FF (receives rounded top borders via borderRadiusApplication: "end")
 */
export const conversionSeriesConfig: ConversionSeriesData[] = [
  {
    nameKey: "newUsers",
    data: [28, 35, 18, 68, 24, 28, 28],
    color: "#7CD4FD",
  },
  {
    nameKey: "websiteSession",
    data: [28, 30, 34, 15, 25, 28, 28],
    color: "#BDB4FE",
  },
  {
    nameKey: "adImpression",
    data: [48, 30, 62, 22, 36, 48, 48],
    color: "#7592FF",
  },
];
