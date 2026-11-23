import * as React from "react";

export interface FeatureItem {
  name: string;
  included: boolean;
}

export interface PricingPlanTwo {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: FeatureItem[];
  icon?: React.ReactNode;
  isPopular?: boolean;
  buttonText: string;
}

export interface PricingCardProps {
  plan: PricingPlanTwo;
  onSelect?: (plan: PricingPlanTwo) => void;
  className?: string;
}

export interface PricingTableTwoProps {
  className?: string;
  plans?: PricingPlanTwo[];
  onSelectPlan?: (plan: PricingPlanTwo) => void;
}
