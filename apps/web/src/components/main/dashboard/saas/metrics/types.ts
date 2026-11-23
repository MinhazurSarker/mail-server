import type { ReactNode } from "react";

export type Timeframe = "weekly" | "monthly" | "yearly";

export type MetricDirection = "up" | "down";

export type MetricTitleKey = "totalRevenue" | "activeUsers" | "clv" | "cac";

export interface MetricItemData {
  id: string;
  titleKey: MetricTitleKey;
  value: string;
  change: string;
  direction: MetricDirection;
}

export type MetricsDataMap = Record<Timeframe, MetricItemData[]>;

export interface MetricItemProps {
  title: string;
  value: string;
  change?: string;
  direction?: MetricDirection;
  badge?: ReactNode;
  className?: string;
  isLast?: boolean;
  children?: ReactNode;
}

export interface MetricsGridProps {
  children: ReactNode;
  className?: string;
}

export interface MetricsHeaderProps {
  title?: string;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onFilterClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface SaasMetricsProps {
  initialTimeframe?: Timeframe;
  timeframe?: Timeframe;
  onTimeframeChange?: (timeframe: Timeframe) => void;
  data?: MetricsDataMap;
  onFilterClick?: () => void;
  className?: string;
  children?: ReactNode;
}
