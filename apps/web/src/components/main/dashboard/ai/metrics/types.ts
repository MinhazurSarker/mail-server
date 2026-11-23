import type { ReactNode } from "react";

export type StatDirection = "up" | "down";

export type StatKey = "users" | "projects" | "revenue" | "paidUsers";

export interface StatItem {
  id: number | string;
  titleKey: StatKey;
  value: string;
  change: string;
  direction: StatDirection;
  icon?: ReactNode;
  comparisonKey?: string;
}

export interface StatCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  direction?: StatDirection;
  comparisonText?: string;
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// Aliases for consistency with metrics composition pattern
export type MetricDirection = StatDirection;
export type MetricKey = StatKey;
export type MetricItem = StatItem;
export type MetricCardProps = StatCardProps;
