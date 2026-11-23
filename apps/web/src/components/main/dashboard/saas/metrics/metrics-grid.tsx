import { Children, isValidElement, cloneElement } from "react";
import { cn } from "@/utils";
import type { MetricsGridProps } from "./types";

const borderClasses = [
  "border-b border-gray-200 dark:border-gray-800 sm:border-e xl:border-b-0",
  "border-b border-gray-200 dark:border-gray-800 xl:border-e xl:border-b-0",
  "border-b border-gray-200 dark:border-gray-800 sm:border-e sm:border-b-0 xl:border-e",
  "",
];

export default function MetricsGrid({ children, className }: MetricsGridProps) {
  const items = Children.toArray(children);

  return (
    <div
      className={cn(
        "grid grid-cols-1 rounded-xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      {items.map((child, index) => {
        const borderClass = borderClasses[index] ?? "";
        if (isValidElement<{ className?: string }>(child)) {
          return cloneElement(child, {
            className: cn(child.props.className, borderClass),
          });
        }
        return (
          <div key={index} className={borderClass}>
            {child}
          </div>
        );
      })}
    </div>
  );
}
