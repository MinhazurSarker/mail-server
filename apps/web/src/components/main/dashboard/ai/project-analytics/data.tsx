import { BoltTwoIcon, CalendarIcon, ClockIcon, TargetIcon } from "@/icons";
import { ProjectMetricItem } from "./types";

export const projectAnalyticsMetricsData: ProjectMetricItem[] = [
  {
    id: "today",
    titleKey: "today",
    value: "120",
    comparisonKey: "projectCreated",
    icon: <BoltTwoIcon className="size-5 text-purple-400" />,
  },
  {
    id: "yesterday",
    titleKey: "yesterday",
    value: "392",
    comparisonKey: "projectCreated",
    icon: <ClockIcon className="size-5 text-sky-500" />,
  },
  {
    id: "this-month",
    titleKey: "thisMonth",
    value: "3,835",
    change: "+2,093",
    isPositive: true,
    comparisonKey: "fromLastMonth",
    icon: <CalendarIcon className="size-5 text-green-500" />,
  },
  {
    id: "this-year",
    titleKey: "thisYear",
    value: "12,958",
    change: "+8,532",
    isPositive: true,
    comparisonKey: "fromLastYear",
    icon: <TargetIcon className="size-5 text-pink-500" />,
  },
];
