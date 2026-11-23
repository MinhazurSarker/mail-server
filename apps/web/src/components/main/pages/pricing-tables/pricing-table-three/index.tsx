"use client";

import { cn } from "@/utils";
import { defaultPlansThree } from "./data";
import PricingCard from "./pricing-card";
import { PricingTableThreeProps } from "./types";

export default function PricingTableThree({
  className,
  plans = defaultPlansThree,
  onSelectPlan,
}: PricingTableThreeProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.id} plan={plan} onSelect={onSelectPlan} />
      ))}
    </div>
  );
}
