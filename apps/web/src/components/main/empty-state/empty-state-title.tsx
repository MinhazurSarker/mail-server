import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn(
        "text-title-lg leading-7.5 font-semibold text-gray-800 dark:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

export default EmptyStateTitle;
