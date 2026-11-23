import { DollarIcon, GroupIcon, ShootingStarIcon } from "@/icons";
import { MetricItem } from "./types";

export const marketingMetricsData: MetricItem[] = [
  {
    id: 1,
    titleKey: "avgClientRating",
    value: "7.8/10",
    change: "+20%",
    direction: "up",
    icon: <ShootingStarIcon />,
  },
  {
    id: 2,
    titleKey: "instagramFollowers",
    value: "5,934",
    change: "-3.59%",
    direction: "down",
    icon: <GroupIcon />,
  },
  {
    id: 3,
    titleKey: "totalRevenue",
    value: "$9,758",
    change: "+15%",
    direction: "up",
    icon: <DollarIcon />,
  },
];
