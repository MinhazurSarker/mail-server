import { PricingPlanThree } from "./types";

export const defaultPlansThree: PricingPlanThree[] = [
  {
    id: "personal",
    name: "Personal",
    subtitle: "Perfect plan for Starters",
    price: "Free",
    period: "For a Lifetime",
    isCurrent: true,
    buttonText: "Current Plan",
    features: [
      "Unlimited Projects",
      "Share with 5 team members",
      "Sync across devices",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    subtitle: "For users who want to do more",
    price: "$99",
    period: "/year",
    buttonText: "Try for Free",
    features: [
      "Unlimited Projects",
      "Share with 5 team members",
      "Sync across devices",
      "30 days version history",
    ],
  },
  {
    id: "team",
    name: "Team",
    subtitle: "Your entire team in one place",
    price: "$299",
    period: "/year",
    isRecommended: true,
    buttonText: "Try for Free",
    features: [
      "Unlimited Projects",
      "Share with 5 team members",
      "Sync across devices",
      "Sharing permissions",
      "Admin tools",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Run your company on your terms",
    price: "Custom",
    period: "Reach out for a quote",
    buttonText: "Try for Free",
    features: [
      "Unlimited Projects",
      "Share with 5 team members",
      "Sync across devices",
      "User provisioning (SCIM)",
      "Advanced security",
    ],
  },
];
