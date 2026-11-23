import { PlanBenefitItem, PlanDetailsData, PlanInfoData } from "./types";

export const defaultPlanInfo: PlanInfoData = {
  currentPlan: "Professional",
  monthlyLimits: "25,000 Orders",
  cost: "$199.00",
  billingPeriod: "/month",
  renewalDate: "Mar 22, 2028",
  usedOrders: 15299,
  totalOrders: 25500,
};

export const defaultPlanBenefits: PlanBenefitItem[] = [
  { text: "25,500 orders per month", included: true },
  { text: "Unlimited integrations", included: true },
  { text: "Exclusive AutoFile discount", included: true },
  { text: "10 GB Storage", included: true },
  { text: "Custom Templates", included: false },
  { text: "Advanced Marketing tool", included: false },
];

export const defaultPlanDetails: PlanDetailsData = {
  planInfo: defaultPlanInfo,
  benefits: defaultPlanBenefits,
};
