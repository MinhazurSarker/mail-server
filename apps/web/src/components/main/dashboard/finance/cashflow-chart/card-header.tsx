"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { TimeframeOption, timeframes, YearOption, years } from "./data";

interface CardHeaderProps {
  selectedYear: YearOption;
  onSelectYear: (year: YearOption) => void;
  selectedTimeframe: TimeframeOption;
  onSelectTimeframe: (timeframe: TimeframeOption) => void;
}

export default function CardHeader({
  selectedYear,
  onSelectYear,
  selectedTimeframe,
  onSelectTimeframe,
}: CardHeaderProps) {
  const t = useTranslations("finance.cashflow");

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <CardTitle className="mb-0 text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
      </div>

      <div className="flex items-center gap-2">
        {/* Year Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <span>{selectedYear}</span>
            <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 min-w-32 p-1.5">
            {years.map((year) => (
              <DropdownMenuItem
                key={year}
                onClick={() => onSelectYear(year)}
                className={cn(
                  "cursor-pointer text-sm",
                  selectedYear === year &&
                    "bg-gray-100 font-medium dark:bg-white/5",
                )}
              >
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Timeframe Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <span>{selectedTimeframe}</span>
            <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 min-w-36 p-1.5">
            {timeframes.map((tf) => (
              <DropdownMenuItem
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={cn(
                  "cursor-pointer text-sm",
                  selectedTimeframe === tf &&
                    "bg-gray-100 font-medium dark:bg-white/5",
                )}
              >
                {tf}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
