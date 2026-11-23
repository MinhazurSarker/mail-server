import { AttendanceHeatmapDataMap, HeatmapRow, PeriodType } from "./types";

export const attendancePeriods: readonly PeriodType[] = [
  "monthly",
  "weekly",
  "yearly",
] as const;

export const attendanceDayKeys = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export const attendanceHeatmapDataByPeriod: AttendanceHeatmapDataMap = {
  monthly: [
    {
      time: "01:00 PM",
      levels: [1, 0, 0, 1, 0, 1, 1],
    },
    {
      time: "12:00 PM",
      levels: [3, 3, 3, 3, 2, 1, 2],
    },
    {
      time: "11:00 AM",
      levels: [1, 4, 1, 2, 2, 4, 3],
    },
    {
      time: "10:00 AM",
      levels: [3, 2, 0, 4, 2, 4, 5],
    },
    {
      time: "09:00 AM",
      levels: [5, 5, 5, 3, 3, 5, 5],
    },
  ],
  weekly: [
    {
      time: "01:00 PM",
      levels: [2, 1, 1, 2, 0, 0, 0],
    },
    {
      time: "12:00 PM",
      levels: [4, 4, 4, 3, 3, 1, 0],
    },
    {
      time: "11:00 AM",
      levels: [3, 5, 4, 4, 3, 1, 1],
    },
    {
      time: "10:00 AM",
      levels: [5, 4, 3, 5, 4, 2, 1],
    },
    {
      time: "09:00 AM",
      levels: [5, 5, 5, 4, 4, 1, 0],
    },
  ],
  yearly: [
    {
      time: "01:00 PM",
      levels: [2, 2, 1, 2, 1, 1, 1],
    },
    {
      time: "12:00 PM",
      levels: [3, 4, 4, 4, 3, 2, 1],
    },
    {
      time: "11:00 AM",
      levels: [2, 3, 3, 3, 3, 2, 2],
    },
    {
      time: "10:00 AM",
      levels: [4, 3, 2, 4, 3, 3, 4],
    },
    {
      time: "09:00 AM",
      levels: [4, 5, 5, 4, 4, 3, 3],
    },
  ],
};

export const attendanceHeatmapData: HeatmapRow[] =
  attendanceHeatmapDataByPeriod.monthly;

export const levelColorMap: Record<number, string> = {
  0: "bg-gray-100 dark:bg-gray-800",
  1: "bg-brand-100 dark:bg-brand-950/60",
  2: "bg-brand-200 dark:bg-brand-900/60",
  3: "bg-brand-300 dark:bg-brand-700/60",
  4: "bg-brand-400 dark:bg-brand-600/70",
  5: "bg-brand-500 dark:bg-brand-500",
};
