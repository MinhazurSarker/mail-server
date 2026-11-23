"use client";

import { Progress } from "@/components/ui/progress-bar";
import { cn } from "@/utils";
import * as React from "react";
import { defaultPlanInfo } from "./data";
import PlanInfoItem from "./plan-info-item";
import { PlanInfoProps } from "./types";

export default function PlanInfo({
  data,
  currentPlan = data?.currentPlan ?? defaultPlanInfo.currentPlan,
  monthlyLimits = data?.monthlyLimits ?? defaultPlanInfo.monthlyLimits,
  cost = data?.cost ?? defaultPlanInfo.cost,
  billingPeriod = data?.billingPeriod ?? defaultPlanInfo.billingPeriod,
  renewalDate = data?.renewalDate ?? defaultPlanInfo.renewalDate,
  usedOrders = data?.usedOrders ?? defaultPlanInfo.usedOrders,
  totalOrders = data?.totalOrders ?? defaultPlanInfo.totalOrders,
  ordersSummary = data?.ordersSummary,
  progressValue = data?.progressValue,
  className,
}: PlanInfoProps) {
  const calculatedProgress =
    progressValue ??
    (totalOrders > 0
      ? Math.min(100, Math.max(0, Math.round((usedOrders / totalOrders) * 100)))
      : 0);

  const displayOrdersText =
    ordersSummary ??
    `${usedOrders.toLocaleString()} of ${totalOrders.toLocaleString()} orders used`;

  return (
    <div
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-transparent",
        className,
      )}
    >
      {/* Plan attributes list */}
      <div className="divide-y divide-gray-200 p-5 dark:divide-gray-800">
        <PlanInfoItem label="Current Plan" value={currentPlan} />
        <PlanInfoItem label="Monthly Limits" value={monthlyLimits} />
        <PlanInfoItem
          label="Cost"
          value={cost}
          subtext={billingPeriod}
        />
        <PlanInfoItem label="Renewal Date" value={renewalDate} />
      </div>

      {/* Orders usage section */}
      <div className="border-t border-gray-200 p-5 dark:border-gray-800">
        <div className="mb-5 flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Orders
          </span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {displayOrdersText}
          </span>
        </div>
        <Progress value={calculatedProgress} className="w-full" />
      </div>
    </div>
  );
}
