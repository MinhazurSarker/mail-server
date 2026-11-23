import { cn } from "@/utils";
import * as React from "react";

export function EmptyState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "relative flex min-h-117.75 w-full flex-col items-center justify-start overflow-hidden pt-28.5 pb-10.75",
        className,
      )}
      {...props}
    />
  );
}

export default EmptyState;
