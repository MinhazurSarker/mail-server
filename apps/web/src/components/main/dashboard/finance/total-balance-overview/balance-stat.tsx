"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import BalanceChart from "./balance-chart";

interface BalanceStatProps {
  amount?: string;
  percentage?: string;
  isPositive?: boolean;
  chartData?: number[];
}

export default function BalanceStat({
  amount = "19,857.00",
  percentage = "3.2%",
  isPositive = true,
  chartData,
}: BalanceStatProps) {
  const t = useTranslations("finance.totalBalanceOverview");

  return (
    <div className="flex items-end border-b border-dashed border-gray-200 pb-7 dark:border-gray-800">
      <div>
        <h3 className="mb-2 text-3xl font-medium text-gray-800 dark:text-white/90">
          {amount}
        </h3>
        <p className="flex items-center gap-1.5 text-sm font-normal text-gray-500 dark:text-gray-400">
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500",
            )}
          >
            {isPositive ? (
              <ArrowUpIcon className="size-3.5" />
            ) : (
              <ArrowDownIcon className="size-3.5" />
            )}
            {percentage}
          </span>
          {t("thanLastMonth")}
        </p>
      </div>

      <BalanceChart seriesName={t("balance")} data={chartData} />
    </div>
  );
}

