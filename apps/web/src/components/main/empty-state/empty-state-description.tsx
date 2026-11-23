import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn(
        "text-sm leading-5 font-normal text-gray-500 dark:text-gray-400",
        className,
      )}
      {...props}
    />
  );
}

export default EmptyStateDescription;
