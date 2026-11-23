import type { ReactNode } from "react";

export type StockDirection = "up" | "down";

export interface TrendingStockItem {
  id: number | string;
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  direction?: StockDirection;
  logoBg?: string;
  icon?: ReactNode;
}

export interface TrendingStockCardProps {
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  direction?: StockDirection;
  logoBg?: string;
  icon?: ReactNode;
  className?: string;
}

export type TrendingCardProps = TrendingStockCardProps;
