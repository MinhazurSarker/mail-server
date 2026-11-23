import type { ReactNode } from "react";

export type MetricDirection = "up" | "down";

export interface StockMetricItem {
  id: number;
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  direction: MetricDirection;
  logoBg: string;
  icon: ReactNode;
}

export interface StockMetricCardProps {
  symbol: string;
  companyName: string;
  price: string;
  change?: string;
  direction?: MetricDirection;
  icon?: ReactNode;
  logoBg?: string;
  badge?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// Aliases matching marketing metrics pattern
export type MetricItem = StockMetricItem;
export type MetricCardProps = StockMetricCardProps;
