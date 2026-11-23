export type PeriodType = "monthly" | "weekly" | "yearly";
export type AttendanceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface HeatmapRow {
  time: string;
  levels: AttendanceLevel[];
}

export type AttendanceHeatmapDataMap = Record<PeriodType, HeatmapRow[]>;

export interface AttendanceOverviewProps {
  className?: string;
  initialPeriod?: PeriodType;
  period?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
  data?: AttendanceHeatmapDataMap;
}

export interface CardHeaderProps {
  selectedPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
}

export interface HeatmapGridProps {
  data?: HeatmapRow[];
}

export interface TooltipState {
  day: string;
  time: string;
  level: AttendanceLevel;
  x: number;
  y: number;
  placement: "top" | "bottom";
  align?: "center" | "left" | "right";
}

