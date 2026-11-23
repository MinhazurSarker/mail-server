export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyDiscountPrice: string;
  annualDiscountPrice: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  isMonthly: boolean;
  onSelect?: (plan: PricingPlan) => void;
  className?: string;
}

export interface BillingToggleProps {
  isMonthly: boolean;
  onChange: (isMonthly: boolean) => void;
  className?: string;
}

export interface PricingTableOneProps {
  className?: string;
  plans?: PricingPlan[];
  onSelectPlan?: (plan: PricingPlan) => void;
}
