"use client";

import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress-bar";
import { useTranslations } from "next-intl";

interface StatItem {
  id: string;
  labelKey: "marketing" | "sales";
  amount: string;
  percentage: number;
}

const statsData: StatItem[] = [
  {
    id: "marketing",
    labelKey: "marketing",
    amount: "$30,569.00",
    percentage: 85,
  },
  {
    id: "sales",
    labelKey: "sales",
    amount: "$20,486.00",
    percentage: 55,
  },
];

export default function RevenueStats() {
  const t = useTranslations("crm.estimatedRevenue");

  return (
    <div className="flex flex-col gap-5 border-t border-gray-100 pt-6 dark:border-gray-800">
      {statsData.map((item) => (
        <div key={item.id} className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {t(item.labelKey)}
            </p>
            <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
              {item.amount}
            </p>
          </div>

          <Progress
            value={item.percentage}
            className="w-full max-w-33 flex-nowrap items-center gap-3 sm:max-w-35"
          >
            <ProgressTrack className="h-1.5 flex-1">
              <ProgressIndicator />
            </ProgressTrack>
            <ProgressValue className="text-sm font-medium text-gray-700 dark:text-gray-400" />
          </Progress>
        </div>
      ))}
    </div>
  );
}
