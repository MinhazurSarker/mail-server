import type { ReactNode } from "react";

export type ProjectMetricKey =
  | "today"
  | "yesterday"
  | "thisMonth"
  | "thisYear";

export type ProjectComparisonKey =
  | "projectCreated"
  | "fromLastMonth"
  | "fromLastYear";

export interface ProjectMetricItem {
  id: string | number;
  titleKey: ProjectMetricKey;
  value: string | number;
  icon: ReactNode;
  change?: string;
  comparisonKey?: ProjectComparisonKey;
  isPositive?: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
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

export interface ProjectAnalyticsProps {
  className?: string;
  data?: ProjectMetricItem[];
  totalProjects?: string | number;
}
