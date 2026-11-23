import { ReactNode } from "react";

export interface OrderHistoryItem {
  id: string | number;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  icon: ReactNode;
  actions?: Array<{
    label: string;
    onClick?: () => void;
  }>;
}

export interface OrderHistoryProps {
  items?: OrderHistoryItem[];
  title?: string;
  className?: string;
}
