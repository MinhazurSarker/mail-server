import { cn } from "@/utils";
import * as React from "react";

export function EmptyStateIllustration({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-state-illustration"
      className={cn(
        "relative flex h-37 w-41 items-center justify-center bg-linear-to-b from-white to-transparent dark:from-gray-900/40 dark:to-transparent",
        className,
      )}
      {...props}
    >
      <div className="flex size-25 items-center justify-center">{children}</div>
    </div>
  );
}

export default EmptyStateIllustration;
