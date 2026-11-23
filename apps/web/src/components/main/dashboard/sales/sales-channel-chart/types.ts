export type ChannelKey = "website" | "email" | "socialMedia";

export interface ChannelItem {
  id: ChannelKey;
  labelKey: string;
  metric: number;
  change: string;
  isIncrease: boolean;
  dotColorClass: string;
}

export interface ChannelStatsData {
  total: number;
  change: string;
  isIncrease: boolean;
}

export interface ProgressBarData {
  darkCount: number;
  lightCount: number;
  grayCount: number;
}
