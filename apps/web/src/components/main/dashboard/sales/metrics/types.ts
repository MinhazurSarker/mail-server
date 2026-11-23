import type { ReactNode } from "react";

export type StatDirection = "up" | "down";

export type StatKey =
  | "totalRevenue"
  | "totalSales"
  | "conversionRate"
  | "refundRate";

export interface StatItem {
  id: number | string;
  titleKey: StatKey;
  value: string;
  change: string;
  direction: StatDirection;
  icon?: ReactNode;
  comparisonKey?: string;
  chartColor: string;
}

export interface StatCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  direction?: StatDirection;
  comparisonText?: string;
  badge?: ReactNode;
  chartColor?: string;
  seriesName?: string;
  chartData?: number[];
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  onFilter?: () => void;
  onExport?: () => void;
}

// Aliases for consistency with metrics composition pattern
export type MetricDirection = StatDirection;
export type MetricKey = StatKey;
export type MetricItem = StatItem;
export type MetricCardProps = StatCardProps;
