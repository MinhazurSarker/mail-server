"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";
import { ComponentProps, useMemo, useState } from "react";
import ActionButtons from "./action-buttons";
import BalanceStat from "./balance-stat";
import TotalBalanceHeader from "./card-header";
import { currencies, getBalanceOverviewData, periods } from "./data";
import PrimaryAccount from "./primary-account";

export default function TotalBalanceOverview({
  className,
}: ComponentProps<"div">) {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  const overviewData = useMemo(
    () => getBalanceOverviewData(selectedCurrency.name, selectedPeriod),
    [selectedCurrency.name, selectedPeriod],
  );

  return (
    <div
      className={cn(
        "rounded-[18px] border border-gray-200 bg-gray-100 p-1.5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <Card className="gap-0 rounded-xl border-none bg-white p-6 pb-8 shadow-none sm:p-6 sm:pb-8 dark:bg-gray-900">
        <TotalBalanceHeader
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        <CardContent className="p-0">
          <BalanceStat
            amount={overviewData.amount}
            percentage={overviewData.percentage}
            isPositive={overviewData.isPositive}
            chartData={overviewData.chartData}
          />
          <PrimaryAccount accountNumber={overviewData.accountNumber} />
        </CardContent>
      </Card>
      <ActionButtons />
    </div>
  );
}
