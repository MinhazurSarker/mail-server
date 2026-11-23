import { cn } from "@/utils";
import { MetricItemProps } from "./types";

export default function MetricItem({
  item,
  index,
  className,
}: MetricItemProps) {
  const borderClasses = [
    "border-b sm:border-b lg:border-b-0 sm:border-e",
    "border-b sm:border-b lg:border-b-0 sm:border-e-0 lg:border-e",
    "border-b sm:border-b-0 lg:border-b-0 sm:border-e",
    "border-b-0 sm:border-b-0 lg:border-b-0 sm:border-e-0 lg:border-e-0",
  ][index] ?? "";

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-gray-200 p-5 dark:border-gray-800",
        borderClasses,
        className,
      )}
    >
      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
        {item.label}
      </p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-heading-five font-medium text-gray-800 dark:text-white/90">
          {item.value}
        </h3>
        {item.unit && (
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {item.unit}
          </span>
        )}
      </div>
    </div>
  );
}
