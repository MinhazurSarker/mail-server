import { PROGRESS_DATA } from "./data";

interface ChannelBarChartProps {
  darkCount?: number;
  lightCount?: number;
  grayCount?: number;
}

export default function ChannelBarChart({
  darkCount = PROGRESS_DATA.darkCount,
  lightCount = PROGRESS_DATA.lightCount,
  grayCount = PROGRESS_DATA.grayCount,
}: ChannelBarChartProps) {
  return (
    <div className="flex h-8 w-full items-center justify-between px-0.5">
      {Array.from({ length: darkCount }).map((_, i) => (
        <div
          key={`brand-${i}`}
          className="h-full w-1 shrink-0 rounded-[1px] bg-brand-500"
        />
      ))}
      {Array.from({ length: lightCount }).map((_, i) => (
        <div
          key={`blue-${i}`}
          className="h-full w-1 shrink-0 rounded-[1px] bg-[#00BCFF]"
        />
      ))}
      {Array.from({ length: grayCount }).map((_, i) => (
        <div
          key={`gray-${i}`}
          className="h-full w-1 shrink-0 rounded-[1px] bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}
