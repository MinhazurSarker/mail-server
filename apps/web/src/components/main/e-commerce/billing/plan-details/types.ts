import * as React from "react";

export interface PlanBenefitItem {
  text: string;
  included: boolean;
}

export interface PlanInfoData {
  currentPlan: string;
  monthlyLimits: string;
  cost: string;
  billingPeriod: string;
  renewalDate: string;
  usedOrders: number;
  totalOrders: number;
  ordersSummary?: string;
  progressValue?: number;
}

export interface PlanDetailsData {
  planInfo: PlanInfoData;
  benefits: PlanBenefitItem[];
}

export interface PlanInfoItemProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  className?: string;
}

export interface PlanInfoProps {
  data?: PlanInfoData;
  currentPlan?: string;
  monthlyLimits?: string;
  cost?: string;
  billingPeriod?: string;
  renewalDate?: string;
  usedOrders?: number;
  totalOrders?: number;
  ordersSummary?: string;
  progressValue?: number;
  className?: string;
}

export interface PlanBenefitsProps {
  title?: string;
  benefits?: PlanBenefitItem[];
  cancelLabel?: string;
  upgradeLabel?: string;
  onCancelSubscription?: () => void;
  onUpgrade?: () => void;
  className?: string;
}

