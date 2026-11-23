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
import { TimeframeOption, timeframes } from "./data";

interface CardHeaderProps {
  selectedTimeframe: TimeframeOption;
  onSelectTimeframe: (timeframe: TimeframeOption) => void;
}

export default function CardHeader({
  selectedTimeframe,
  onSelectTimeframe,
}: CardHeaderProps) {
  const t = useTranslations("finance.spending");

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <CardTitle className="mb-0 text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" size="sm" />}
        >
          <span>
            {selectedTimeframe === "Yearly" ? t("yearly") : t("monthly")}
          </span>
          <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 min-w-32 p-1.5">
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
              {tf === "Yearly" ? t("yearly") : t("monthly")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
