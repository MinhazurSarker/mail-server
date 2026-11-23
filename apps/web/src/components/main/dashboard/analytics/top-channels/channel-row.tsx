import { ChannelItem } from "./types";

interface ChannelRowProps {
  channel: ChannelItem;
}

export default function ChannelRow({ channel }: ChannelRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {channel.source}
      </span>
      <span className="text-end text-sm text-gray-500 dark:text-gray-400">
        {channel.visitors}
      </span>
    </div>
  );
}
