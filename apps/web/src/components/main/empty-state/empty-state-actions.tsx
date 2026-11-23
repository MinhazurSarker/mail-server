import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn(
        "mt-5 flex flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

export default EmptyStateActions;
