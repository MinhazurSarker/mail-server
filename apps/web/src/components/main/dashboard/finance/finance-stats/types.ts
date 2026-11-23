import type { ReactNode } from "react";

export type StatDirection = "up" | "down";

export type StatKey =
  "totalBalance" | "monthlyIncome" | "totalSpent" | "savingRate";

export interface StatItem {
  id: number | string;
  titleKey: StatKey;
  value: string;
  change?: string;
  direction?: StatDirection;
  comparisonKey?: string;
  icon: ReactNode;
  badge?: ReactNode;
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

export interface FinanceStatsProps {
  className?: string;
  data?: StatItem[];
}
