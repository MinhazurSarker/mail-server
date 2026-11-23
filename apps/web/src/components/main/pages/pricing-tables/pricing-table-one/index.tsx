"use client";

import { cn } from "@/utils";
import * as React from "react";
import BillingToggle from "./billing-toggle";
import { defaultPlans } from "./data";
import PricingCard from "./pricing-card";
import { PricingTableOneProps } from "./types";

export default function PricingTableOne({
  className,
  plans = defaultPlans,
  onSelectPlan,
}: PricingTableOneProps) {
  const [isMonthly, setIsMonthly] = React.useState(true);

  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto mb-7 w-full max-w-115 text-center">
        <h2 className="text-2xl leading-tight font-bold text-gray-800 sm:text-heading-five sm:leading-10 dark:text-white/90">
          Flexible Plans Tailored to Fit Your Unique Needs!
        </h2>
      </div>

      <BillingToggle isMonthly={isMonthly} onChange={setIsMonthly} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isMonthly={isMonthly}
            onSelect={onSelectPlan}
          />
        ))}
      </div>
    </div>
  );
}
