import { CalendarIcon, TargetIcon, UserDollarIcon, UsersIcon } from "@/icons";
import { UserMetricItem } from "./types";

export const userAnalyticsMetricsData: UserMetricItem[] = [
  {
    id: "free-users",
    titleKey: "freeUsers",
    value: "15,682",
    percentage: "95%",
    comparisonKey: "ofTotalUser",
    icon: <UsersIcon className="size-5 text-brand-500 dark:text-brand-400" />,
  },
  {
    id: "paid-users",
    titleKey: "paidUsers",
    value: "305",
    percentage: "5%",
    comparisonKey: "ofTotalUser",
    icon: (
      <UserDollarIcon className="size-5 text-orange-500 dark:text-orange-400" />
    ),
  },
  {
    id: "this-month",
    titleKey: "thisMonth",
    value: "4,925",
    change: "+5,238",
    isPositive: true,
    comparisonKey: "fromLastMonth",
    icon: <CalendarIcon className="size-5 text-green-500" />,
  },
  {
    id: "this-year",
    titleKey: "thisYear",
    value: "12,489",
    change: "+12,495",
    isPositive: true,
    comparisonKey: "fromLastYear",
    icon: <TargetIcon className="size-5 text-pink-500" />,
  },
];
