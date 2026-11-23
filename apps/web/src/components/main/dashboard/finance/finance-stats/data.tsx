import {
  CardSpentIcon,
  GoalProgressGauge,
  PiggyBankIcon,
  TrendingIncomeIcon,
  WalletIcon,
} from "./icons";
import { StatItem } from "./types";

export const financeStatsData: StatItem[] = [
  {
    id: 1,
    titleKey: "totalBalance",
    value: "$24,830",
    change: "3.2%",
    direction: "up",
    comparisonKey: "thanLastMonth",
    icon: (
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-500/10">
        <WalletIcon />
      </span>
    ),
  },
  {
    id: 2,
    titleKey: "monthlyIncome",
    value: "$5,200",
    change: "3.2%",
    direction: "down",
    comparisonKey: "thanLastMonth",
    icon: (
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-green-500/10">
        <TrendingIncomeIcon />
      </span>
    ),
  },
  {
    id: 3,
    titleKey: "totalSpent",
    value: "$3,831",
    change: "295",
    direction: "up",
    comparisonKey: "thanLastMonth",
    icon: (
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-orange-500/10">
        <CardSpentIcon />
      </span>
    ),
  },
  {
    id: 4,
    titleKey: "savingRate",
    value: "26.1%",
    comparisonKey: "goalProgress",
    badge: (
      <span>
        <GoalProgressGauge />
      </span>
    ),
    icon: (
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-pink-500/10">
        <PiggyBankIcon />
      </span>
    ),
  },
];
