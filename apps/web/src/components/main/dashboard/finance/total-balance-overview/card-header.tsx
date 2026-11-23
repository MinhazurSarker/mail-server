"use client";

import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { CheckIcon, ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Currency, currencies, periods } from "./types";

interface TotalBalanceHeaderProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function TotalBalanceHeader({
  selectedCurrency,
  onCurrencyChange,
  selectedPeriod,
  onPeriodChange,
}: TotalBalanceHeaderProps) {
  const t = useTranslations("finance.totalBalanceOverview");

  return (
    <CardHeader className="mb-10 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle className="text-base font-medium text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          {t("overview")}
        </CardDescription>
      </div>

      <CardAction className="col-auto row-auto flex shrink-0 items-center gap-2 self-auto justify-self-auto">
        {/* Currency Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                <Image
                  src={selectedCurrency.flag}
                  alt={selectedCurrency.name}
                  width={16}
                  height={16}
                  className="size-4 rounded-full object-cover"
                />
                <span>{selectedCurrency.name}</span>
                <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36 min-w-0 p-1.5">
            {currencies.map((currency) => {
              const isSelected = selectedCurrency.name === currency.name;
              return (
                <DropdownMenuItem
                  key={currency.name}
                  onClick={() => onCurrencyChange(currency)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                    isSelected && "bg-gray-100 font-medium dark:bg-white/5",
                  )}
                >
                  <Image
                    src={currency.flag}
                    alt={currency.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-full object-cover"
                  />
                  <span>{currency.name}</span>
                  {isSelected && (
                    <CheckIcon className="ms-auto size-3.5 text-brand-500" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date / Period Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="sm">
                <span>{selectedPeriod}</span>
                <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-38 min-w-0 p-1.5">
            {periods.map((period) => {
              const isSelected = selectedPeriod === period;
              return (
                <DropdownMenuItem
                  key={period}
                  onClick={() => onPeriodChange(period)}
                  className={cn(
                    "rounded-lg px-2.5 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                    isSelected && "bg-gray-100 font-medium dark:bg-white/5",
                  )}
                >
                  {period}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardAction>
    </CardHeader>
  );
}
