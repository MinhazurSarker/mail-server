"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/context/theme-context";
import { ApexOptions } from "apexcharts";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CardHeader from "./card-header";
import ChartIndicators from "./chart-indicators";
import {
  cashflowData,
  getCashflowChartOptions,
  SERIES_COLORS,
  TimeframeOption,
  timeframes,
  YearOption,
  years,
} from "./data";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CashflowChart() {
  const { theme } = useTheme();
  const t = useTranslations("finance.cashflow");
  const tMonths = useTranslations("ecommerce.months");

  const [selectedYear, setSelectedYear] = useState<YearOption>(years[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    timeframes[0],
  );

  // Active dataset driven by user dropdown selection
  const currentDataset = useMemo(() => {
    return cashflowData[selectedYear][selectedTimeframe];
  }, [selectedYear, selectedTimeframe]);

  const categories = useMemo(() => {
    if (currentDataset.isMonthKeys) {
      return currentDataset.categories.map((key) => tMonths(key));
    }
    return currentDataset.categories;
  }, [currentDataset, tMonths]);

  // Stacked order: bottom = Expense (#7CD4FD), top = Income (#7592FF)
  const series = useMemo(
    () => [
      {
        name: t("expense"),
        data: currentDataset.expense,
        color: SERIES_COLORS.expense,
      },
      {
        name: t("income"),
        data: currentDataset.income,
        color: SERIES_COLORS.income,
      },
    ],
    [currentDataset, t],
  );

  const options: ApexOptions = useMemo(
    () =>
      getCashflowChartOptions({
        categories,
        theme,
        colors: series.map((s) => s.color),
      }),
    [categories, theme, series],
  );

  return (
    <Card className="gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
      />

      {/* <div className="mt-6"> */}
      <ChartIndicators
        revenue={currentDataset.revenue}
        growth={currentDataset.growth}
        isPositive={currentDataset.isPositive}
      />
      {/* </div> */}

      <ScrollArea className="max-w-full">
        <div className="-ms-4 min-w-130 xl:min-w-full [&>div]:max-h-55!">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={220}
          />
        </div>
      </ScrollArea>
    </Card>
  );
}
