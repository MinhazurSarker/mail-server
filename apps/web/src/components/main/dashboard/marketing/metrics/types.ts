import type { ReactNode } from "react";

export type MetricDirection = "up" | "down";

export type MetricKey =
  | "avgClientRating"
  | "instagramFollowers"
  | "totalRevenue";

export interface MetricItem {
  id: number;
  titleKey: MetricKey;
  value: string;
  change: string;
  direction: MetricDirection;
  icon: ReactNode;
  comparisonKey?: string;
}

export interface MetricCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  direction?: MetricDirection;
  comparisonText?: string;
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
}
