import { ShootingStarIcon, UserIcon } from "@/icons";
import { BriefcaseIcon } from "../icons";
import { PricingPlanTwo } from "./types";

export const defaultPlansTwo: PricingPlanTwo[] = [
  {
    id: "personal",
    name: "Personal",
    price: "$59.00",
    period: "/ Lifetime",
    description: "For solo designers & freelancers",
    icon: <UserIcon className="size-7" />,
    buttonText: "Choose This Plan",
    features: [
      { name: "5 website", included: true },
      { name: "500 MB Storage", included: true },
      { name: "Unlimited Sub-Domain", included: true },
      { name: "3 Custom Domain", included: true },
      { name: "Free SSL Certificate", included: false },
      { name: "Unlimited Traffic", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$199.00",
    period: "/ Lifetime",
    description: "For solo designers & freelancers",
    isPopular: true,
    icon: <BriefcaseIcon className="size-7" />,
    buttonText: "Choose This Plan",
    features: [
      { name: "5 website", included: true },
      { name: "500 MB Storage", included: true },
      { name: "Unlimited Sub-Domain", included: true },
      { name: "3 Custom Domain", included: true },
      { name: "Free SSL Certificate", included: true },
      { name: "Unlimited Traffic", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$599.00",
    period: "/ Lifetime",
    description: "For solo designers & freelancers",
    icon: <ShootingStarIcon className="size-7" />,
    buttonText: "Choose This Plan",
    features: [
      { name: "5 website", included: true },
      { name: "500 MB Storage", included: true },
      { name: "Unlimited Sub-Domain", included: true },
      { name: "3 Custom Domain", included: true },
      { name: "Free SSL Certificate", included: true },
      { name: "Unlimited Traffic", included: true },
    ],
  },
];
