export interface ChannelItem {
  id: number | string;
  source: string;
  visitors: string;
}

export interface TopChannelsProps {
  data?: ChannelItem[];
  className?: string;
}
