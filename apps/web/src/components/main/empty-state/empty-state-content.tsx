import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-content"
      className={cn(
        "relative z-1 flex w-full max-w-122 flex-col items-center text-center",
        className,
      )}
      {...props}
    />
  );
}

export default EmptyStateContent;
