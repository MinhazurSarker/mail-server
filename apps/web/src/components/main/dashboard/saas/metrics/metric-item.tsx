import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import type { MetricItemProps } from "./types";

export default function MetricItem({
  title,
  value,
  change,
  direction = "up",
  badge,
  className,
  children,
}: MetricItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-6 py-5",
        className,
      )}
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        {title}
      </span>

      <div className="flex items-center gap-3">
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>

        {badge !== undefined ? (
          badge
        ) : change ? (
          <Badge
            color={direction === "up" ? "success" : "error"}
            size="sm"
          >
            {change}
          </Badge>
        ) : null}
      </div>

      {children}
    </div>
  );
}
