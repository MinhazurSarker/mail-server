import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress-bar";
import { cn } from "@/utils";
import Image from "next/image";
import { TrafficSourceItem } from "./types";

interface SourceItemProps {
  source: TrafficSourceItem;
  isLast?: boolean;
}

export default function SourceItem({ source, isLast }: SourceItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        !isLast && "border-b border-gray-100 dark:border-gray-800",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-full max-w-8 items-center rounded-full">
          <Image
            width={32}
            height={32}
            className="w-full"
            src={source.logo}
            alt={source.name}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {source.name}
          </p>
        </div>
      </div>

      <Progress
        value={source.percentage}
        className="w-full max-w-35 flex-nowrap gap-3"
      >
        <ProgressTrack className="h-2">
          <ProgressIndicator className="" />
        </ProgressTrack>
        <ProgressValue className="text-gray-700 dark:text-gray-400" />
      </Progress>
    </div>
  );
}
