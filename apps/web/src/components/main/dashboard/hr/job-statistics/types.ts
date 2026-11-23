export type JobMetricKey = "activeJob" | "interview" | "hired";
export type PeriodType = "monthly" | "weekly" | "yearly";

export interface JobStatMetricConfig {
  id: string;
  key: JobMetricKey;
  value: number;
  indicatorColor: string;
}

export interface JobStatisticsPeriodData {
  totalJobs: number;
  metrics: JobStatMetricConfig[];
}

export type JobStatisticsDataMap = Record<PeriodType, JobStatisticsPeriodData>;

export interface JobStatisticsProps {
  className?: string;
  initialPeriod?: PeriodType;
  period?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
  data?: JobStatisticsDataMap;
}

export interface JobStatisticsChartProps {
  totalJobs: number;
  metrics: JobStatMetricConfig[];
  className?: string;
}
