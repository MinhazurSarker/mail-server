"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { Timeframe } from "./data";

interface CardHeaderProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

export default function CardHeader({
  selectedTimeframe,
  onTimeframeChange,
}: CardHeaderProps) {
  const t = useTranslations("logistics.deliveryStatistics");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            />
          }
        >
          <span>
            {selectedTimeframe === "monthly" ? t("monthly") : t("yearly")}
          </span>
          <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onTimeframeChange("monthly")}>
            {t("monthly")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTimeframeChange("yearly")}>
            {t("yearly")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
