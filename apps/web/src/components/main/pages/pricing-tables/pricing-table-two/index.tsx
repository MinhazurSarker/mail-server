"use client";

import { cn } from "@/utils";
import * as React from "react";
import { defaultPlansTwo } from "./data";
import PricingCard from "./pricing-card";
import { PricingTableTwoProps } from "./types";

export default function PricingTableTwo({
  className,
  plans = defaultPlansTwo,
  onSelectPlan,
}: PricingTableTwoProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.id} plan={plan} onSelect={onSelectPlan} />
      ))}
    </div>
  );
}

export * from "./data";
export { default as PricingCard } from "./pricing-card";
export * from "./types";
