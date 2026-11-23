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

export const impressionData = [
  7500, 12500, 5500, 5000, 3000, 5000, 4500, 18500, 12000, 3500, 11000, 6500,
];

export const getImpressionSeries = (
  seriesName: string,
  dateRangeFactor: number = 1,
) => [
  {
    name: seriesName,
    data: impressionData.map((val) => Math.round(val * dateRangeFactor)),
  },
];
