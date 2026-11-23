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
] as const;

export type MonthKey = (typeof monthKeys)[number];

export type Timeframe = "monthly" | "yearly";

export interface DeliveryIndicator {
  id: "shipment" | "inTransit" | "delivery";
  labelKey: "shipment" | "inTransit" | "delivery";
  color: string;
}

export const deliveryIndicators: DeliveryIndicator[] = [
  { id: "shipment", labelKey: "shipment", color: "#7592FF" },
  { id: "inTransit", labelKey: "inTransit", color: "#BDB4FE" },
  { id: "delivery", labelKey: "delivery", color: "#7CD4FD" },
];

export interface DeliverySeriesItem {
  nameKey: "shipment" | "inTransit" | "delivery";
  data: number[];
  color: string;
}

export const deliverySeriesByTimeframe: Record<
  Timeframe,
  DeliverySeriesItem[]
> = {
  monthly: [
    {
      nameKey: "shipment",
      data: [48, 70, 72, 72, 85, 118, 95, 115, 98, 98],
      color: "#7592FF",
    },
    {
      nameKey: "inTransit",
      data: [120, 138, 192, 185, 140, 202, 152, 200, 156, 156],
      color: "#BDB4FE",
    },
    {
      nameKey: "delivery",
      data: [38, 48, 38, 30, 52, 72, 58, 70, 60, 60],
      color: "#7CD4FD",
    },
  ],
  yearly: [
    {
      nameKey: "shipment",
      data: [60, 75, 80, 85, 95, 125, 105, 120, 110, 115],
      color: "#7592FF",
    },
    {
      nameKey: "inTransit",
      data: [130, 145, 175, 170, 155, 195, 165, 185, 160, 165],
      color: "#BDB4FE",
    },
    {
      nameKey: "delivery",
      data: [42, 50, 44, 38, 56, 76, 62, 72, 65, 68],
      color: "#7CD4FD",
    },
  ],
};
