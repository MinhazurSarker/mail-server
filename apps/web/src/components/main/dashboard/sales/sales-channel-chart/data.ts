import { ChannelItem, ChannelStatsData, ProgressBarData } from "./types";

export const CHANNEL_STATS: ChannelStatsData = {
  total: 75,
  change: "3.2%",
  isIncrease: true,
};

export const PROGRESS_DATA: ProgressBarData = {
  darkCount: 14,
  lightCount: 14,
  grayCount: 14,
};

export const CHANNELS: ChannelItem[] = [
  {
    id: "website",
    labelKey: "channels.website",
    metric: 35,
    change: "5.2%",
    isIncrease: true,
    dotColorClass: "bg-brand-500",
  },
  {
    id: "email",
    labelKey: "channels.email",
    metric: 25,
    change: "2.8%",
    isIncrease: false,
    dotColorClass: "bg-[#00BCFF]",
  },
  {
    id: "socialMedia",
    labelKey: "channels.socialMedia",
    metric: 59,
    change: "4.5%",
    isIncrease: true,
    dotColorClass: "bg-gray-300 dark:bg-gray-600",
  },
];
