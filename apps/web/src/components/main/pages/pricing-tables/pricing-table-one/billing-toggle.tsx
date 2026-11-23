"use client";

import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/utils";
import { BillingToggleProps } from "./types";

export default function BillingToggle({
  isMonthly,
  onChange,
  className,
}: BillingToggleProps) {
  return (
    <div className={cn("mb-10 text-center", className)}>
      <ButtonGroup
        aria-label="Billing frequency"
        className="relative z-1 mx-auto inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-800"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-s-1 top-1/2 -z-1 flex h-11 w-30 -translate-y-1/2 rounded-full bg-white shadow-theme-xs duration-200 ease-linear dark:bg-white/10",
            isMonthly
              ? "translate-x-0"
              : "translate-x-full rtl:-translate-x-full",
          )}
        />
        <button
          type="button"
          aria-pressed={isMonthly}
          onClick={() => onChange(true)}
          className={cn(
            "flex h-11 w-30 items-center justify-center rounded-full text-base font-medium transition-colors focus-visible:outline-hidden",
            isMonthly
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white/70",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={!isMonthly}
          onClick={() => onChange(false)}
          className={cn(
            "flex h-11 w-30 items-center justify-center rounded-full text-base font-medium transition-colors focus-visible:outline-hidden",
            !isMonthly
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white/70",
          )}
        >
          Annually
        </button>
      </ButtonGroup>
    </div>
  );
}
