"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

interface ChartIndicatorsProps {
  revenue: string;
  growth: string;
  isPositive: boolean;
}

export default function ChartIndicators({
  revenue,
  growth,
  isPositive,
}: ChartIndicatorsProps) {
  const t = useTranslations("finance.cashflow");

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {/* Total Revenue & Badge */}
      <div>
        <p className="mb-0.5 text-xs text-gray-500 dark:text-gray-400">
          {t("totalRevenue")}
        </p>
        <div className="flex items-center gap-2">
          <h4 className="text-heading-five font-medium text-gray-800 dark:text-white/90">
            {revenue}
          </h4>
          <Badge
            size="sm"
            variant="light"
            color={isPositive ? "success" : "error"}
          >
            {growth}
          </Badge>
        </div>
      </div>

      {/* Income & Expense Toggles */}
      <div className="flex items-center gap-5">
        <span className={cn("flex items-center gap-2")}>
          <span className="block size-2.5 rounded-full bg-brand-500" />
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {t("income")}
          </span>
        </span>

        <span className={cn("flex items-center gap-2")}>
          <span className="block size-2.5 rounded-full bg-[#7CD4FD]" />
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {t("expense")}
          </span>
        </span>
      </div>
    </div>
  );
}
