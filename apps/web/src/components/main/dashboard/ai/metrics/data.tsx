import { DollarIcon, FolderOpenIcon, UserDollarIcon, UsersIcon } from "@/icons";
import { StatItem } from "./types";

export const aiStatsData: StatItem[] = [
  {
    id: 1,
    titleKey: "users",
    value: "10,590",
    change: "+3.52%",
    direction: "up",
    icon: <UsersIcon className="size-6 text-brand-400" />,
    comparisonKey: "last30Days",
  },
  {
    id: 2,
    titleKey: "projects",
    value: "15,682",
    change: "+3.52%",
    direction: "up",
    icon: <FolderOpenIcon className="size-6 text-blue-400" />,
    comparisonKey: "last30Days",
  },
  {
    id: 3,
    titleKey: "revenue",
    value: "$90,369",
    change: "+14.8%",
    direction: "up",
    icon: <DollarIcon className="size-6 text-green-500" />,
    comparisonKey: "last30Days",
  },
  {
    id: 4,
    titleKey: "paidUsers",
    value: "520",
    change: "-9.05%",
    direction: "down",
    icon: <UserDollarIcon className="size-6 text-orange-400" />,
    comparisonKey: "last30Days",
  },
];

export const statsData = aiStatsData;
