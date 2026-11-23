import type { ReactNode } from "react";

export type WatchlistDirection = "up" | "down";

export interface BaseWatchlistItem {
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  direction: WatchlistDirection;
  logoBg?: string;
  icon?: ReactNode;
}

export interface WatchlistItem extends BaseWatchlistItem {
  id: number | string;
}

export interface WatchlistItemProps extends BaseWatchlistItem {
  className?: string;
}

export interface WatchlistProps {
  items?: WatchlistItem[];
  className?: string;
}
