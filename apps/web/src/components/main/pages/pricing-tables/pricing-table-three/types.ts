export interface PricingPlanThree {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  isCurrent?: boolean;
  isRecommended?: boolean;
  buttonText: string;
}

export interface PricingCardProps {
  plan: PricingPlanThree;
  onSelect?: (plan: PricingPlanThree) => void;
  className?: string;
}

export interface PricingTableThreeProps {
  className?: string;
  plans?: PricingPlanThree[];
  onSelectPlan?: (plan: PricingPlanThree) => void;
}
