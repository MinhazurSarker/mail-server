import { ComponentType } from "react";
import { IconProps } from "../icons";

export type QuickStatKey =
  | "totalEmployee"
  | "activeEmployee"
  | "onLeave"
  | "totalPayroll";

export type PeriodType = "monthly" | "weekly" | "yearly";

export type ComparisonKey =
  | "thanLastMonth"
  | "thanLastWeek"
  | "thanLastYear";

export interface StatItemConfig {
  id: string;
  key: QuickStatKey;
  value: string;
  change: string;
  isPositive: boolean;
  comparisonKey: ComparisonKey;
  icon: ComponentType<IconProps>;
  iconColorClass: string;
}

export type QuickStatsDataMap = Record<PeriodType, StatItemConfig[]>;

export interface QuickStatsProps {
  className?: string;
  initialPeriod?: PeriodType;
  period?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
  data?: QuickStatsDataMap;
}
