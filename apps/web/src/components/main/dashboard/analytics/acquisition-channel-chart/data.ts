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

export interface ChannelIndicator {
  id: "direct" | "organic" | "referral";
  labelKey: "direct" | "organic" | "referral";
  color: string;
}

export const channelIndicators: ChannelIndicator[] = [
  { id: "direct", labelKey: "direct", color: "#7592FF" },
  { id: "organic", labelKey: "organic", color: "#BDB4FE" },
  { id: "referral", labelKey: "referral", color: "#7CD4FD" },
];

export interface AcquisitionSeriesData {
  nameKey: "direct" | "organic" | "referral";
  data: number[];
  color: string;
}

/**
 * Series ordered from bottom to top for ApexCharts stacked column bar chart:
 * 1. Referral (bottom) - #7CD4FD
 * 2. Organic (middle)  - #BDB4FE
 * 3. Direct (top)      - #7592FF (receives rounded top borders via borderRadiusApplication: "end")
 */
export const acquisitionSeriesConfig: AcquisitionSeriesData[] = [
  {
    nameKey: "referral",
    data: [28, 35, 18, 68, 24, 28, 28],
    color: "#7CD4FD",
  },
  {
    nameKey: "organic",
    data: [28, 30, 34, 15, 25, 28, 28],
    color: "#BDB4FE",
  },
  {
    nameKey: "direct",
    data: [48, 30, 62, 22, 36, 48, 48],
    color: "#7592FF",
  },
];
