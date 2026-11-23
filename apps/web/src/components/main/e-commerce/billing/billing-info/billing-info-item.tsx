import { cn } from "@/utils";
import { BillingInfoItemProps } from "./types";

export default function BillingInfoItem({
  label,
  value,
  className,
}: BillingInfoItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-5 border-b border-gray-100 py-2.5 last:border-b-0 dark:border-gray-800",
        className,
      )}
    >
      <span className="w-30 shrink-0 text-sm font-normal text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-sm font-normal text-gray-700 dark:text-gray-300">
        {value}
      </span>
    </div>
  );
}
