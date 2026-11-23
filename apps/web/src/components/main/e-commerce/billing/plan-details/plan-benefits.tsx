"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "@/icons";
import { cn } from "@/utils";
import * as React from "react";
import { defaultPlanBenefits } from "./data";
import { PlanBenefitsProps } from "./types";

export default function PlanBenefits({
  title = "Plan Benefits",
  benefits = defaultPlanBenefits,
  cancelLabel = "Cancel Subscription",
  upgradeLabel = "Upgrade to Pro",
  onCancelSubscription,
  onUpgrade,
  className,
}: PlanBenefitsProps) {
  return (
    <div className={cn("flex h-full flex-col justify-between", className)}>
      {/* Benefits section */}
      <div>
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
        <ul className="space-y-3.5">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2.5">
              {benefit.included ? (
                <CheckIcon className="size-4 shrink-0 text-gray-700 dark:text-gray-400" />
              ) : (
                <XIcon className="size-4 shrink-0 text-gray-400 dark:text-gray-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  benefit.included
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-400 line-through dark:text-gray-500",
                )}
              >
                {benefit.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-auto">
        <Button
          variant="outline"
          className="w-full sm:w-37.5"
          onClick={onCancelSubscription}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="default"
          className="w-full sm:flex-1"
          onClick={onUpgrade}
        >
          {upgradeLabel}
        </Button>
      </div>
    </div>
  );
}
