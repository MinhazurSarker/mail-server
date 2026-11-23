import type { ReactNode } from "react";

export type UserMetricKey =
  | "freeUsers"
  | "paidUsers"
  | "thisMonth"
  | "thisYear";

export type UserComparisonKey =
  | "ofTotalUser"
  | "fromLastMonth"
  | "fromLastYear";

export interface UserMetricItem {
  id: string | number;
  titleKey: UserMetricKey;
  value: string | number;
  icon: ReactNode;
  percentage?: string;
  change?: string;
  comparisonKey?: UserComparisonKey;
  isPositive?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  percentage?: string;
  change?: string;
  comparisonText?: string;
  isPositive?: boolean;
  className?: string;
}

export interface SummaryMetricProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  onViewMore?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface UserAnalyticsProps {
  className?: string;
  data?: UserMetricItem[];
  totalUsers?: string | number;
}
