import { JobStatisticsDataMap, JobStatMetricConfig } from "./types";

export const jobStatisticsData: JobStatisticsDataMap = {
  monthly: {
    totalJobs: 120,
    metrics: [
      {
        id: "active-job",
        key: "activeJob",
        value: 64,
        indicatorColor: "bg-brand-500",
      },
      {
        id: "interview",
        key: "interview",
        value: 28,
        indicatorColor: "bg-[#9CB9FF]",
      },
      {
        id: "hired",
        key: "hired",
        value: 32,
        indicatorColor: "bg-[#D9D9D9] dark:bg-gray-600",
      },
    ],
  },
  weekly: {
    totalJobs: 38,
    metrics: [
      {
        id: "active-job",
        key: "activeJob",
        value: 18,
        indicatorColor: "bg-brand-500",
      },
      {
        id: "interview",
        key: "interview",
        value: 12,
        indicatorColor: "bg-[#9CB9FF]",
      },
      {
        id: "hired",
        key: "hired",
        value: 8,
        indicatorColor: "bg-[#D9D9D9] dark:bg-gray-600",
      },
    ],
  },
  yearly: {
    totalJobs: 480,
    metrics: [
      {
        id: "active-job",
        key: "activeJob",
        value: 240,
        indicatorColor: "bg-brand-500",
      },
      {
        id: "interview",
        key: "interview",
        value: 130,
        indicatorColor: "bg-[#9CB9FF]",
      },
      {
        id: "hired",
        key: "hired",
        value: 110,
        indicatorColor: "bg-[#D9D9D9] dark:bg-gray-600",
      },
    ],
  },
};

export const jobStatsMetricsConfig: JobStatMetricConfig[] =
  jobStatisticsData.monthly.metrics;
