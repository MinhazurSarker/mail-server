export type AnalyticsPeriod = "12months" | "30days" | "7days" | "24hours";

export interface TabItem {
  id: AnalyticsPeriod;
  labelKey: "twelveMonths" | "thirtyDays" | "sevenDays" | "twentyFourHours";
}

export const analyticsTabs: TabItem[] = [
  { id: "12months", labelKey: "twelveMonths" },
  { id: "30days", labelKey: "thirtyDays" },
  { id: "7days", labelKey: "sevenDays" },
  { id: "24hours", labelKey: "twentyFourHours" },
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

export const data12Months = [
  7500, 12000, 8200, 7000, 3800, 4800, 7200, 18500, 12800, 4200, 10800, 6800,
];

export const data30Days = [
  7200, 8100, 9400, 11200, 12500, 11800, 9600, 8400, 7900, 6500, 5800, 5200,
  4100, 3900, 4300, 4800, 6200, 7400, 8900, 12400, 16800, 18500, 16200, 13100,
  9800, 6200, 4800, 7600, 10500, 8200,
];

export const categories30Days = Array.from(
  { length: 30 },
  (_, i) => `${i + 1}`,
);

export const data7Days = [6400, 9800, 14200, 12800, 16900, 18500, 11400];
export const categories7Days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const data24Hours = [
  1200, 850, 600, 950, 2400, 5800, 8900, 12400, 14800, 16200, 15100, 13500,
  14200, 15800, 17200, 18500, 16400, 14200, 11800, 9400, 7600, 5400, 3800, 2100,
];
export const categories24Hours = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

export const getAnalyticsData = (
  period: AnalyticsPeriod,
  visitorLabel: string,
  tMonths?: (key: (typeof monthKeys)[number]) => string,
) => {
  switch (period) {
    case "12months":
      return {
        series: [
          {
            name: visitorLabel,
            data: data12Months,
          },
        ],
        categories: monthKeys.map((key) => (tMonths ? tMonths(key) : key)),
      };
    case "7days":
      return {
        series: [
          {
            name: visitorLabel,
            data: data7Days,
          },
        ],
        categories: categories7Days,
      };
    case "24hours":
      return {
        series: [
          {
            name: visitorLabel,
            data: data24Hours,
          },
        ],
        categories: categories24Hours,
      };
    case "30days":
    default:
      return {
        series: [
          {
            name: visitorLabel,
            data: data30Days,
          },
        ],
        categories: categories30Days,
      };
  }
};
