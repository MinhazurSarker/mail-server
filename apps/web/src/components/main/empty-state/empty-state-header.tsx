import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-header"
      className={cn("mt-6 flex flex-col gap-3 text-center", className)}
      {...props}
    />
  );
}

export default EmptyStateHeader;
