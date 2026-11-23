"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import type { TrackingProgressProps } from "./types";

export default function TrackingProgress({
  trackingId,
  statusKey = "inTransit",
  statusLabel,
  steps,
  className,
}: TrackingProgressProps) {
  const t = useTranslations("logistics.trackingProgress");

  const badgeText = statusLabel ?? (statusKey ? t(statusKey) : "");

  return (
    <div
      className={cn(
        "rounded-xl bg-white p-4 sm:p-5 dark:bg-gray-900",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t("trackingId")}
          </span>
          <h4 className="mt-0.5 text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {trackingId}
          </h4>
        </div>

        {badgeText && (
          <Badge
            color="success"
            size="sm"
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          >
            {badgeText}
          </Badge>
        )}
      </div>

      {/* Timeline Steps */}
      <div className="relative mt-6 space-y-6">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.status === "completed";
          const isUpcoming = step.status === "upcoming";

          return (
            <div key={step.id} className="relative flex items-center gap-4">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute inset-s-5.25 top-11 -bottom-6 w-px border-s border-dashed",
                    isCompleted
                      ? "border-brand-500"
                      : "border-gray-200 dark:border-gray-800",
                  )}
                />
              )}

              {/* Icon Circle */}
              <div
                className={cn(
                  "relative z-1 flex size-11 shrink-0 items-center justify-center rounded-full border p-0.5",
                  isUpcoming
                    ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    isUpcoming
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                      : "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
                  )}
                >
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {t(step.titleKey)}
                  </h5>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {step.date}
                  </p>
                </div>

                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {step.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
