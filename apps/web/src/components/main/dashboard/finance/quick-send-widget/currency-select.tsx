"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Field, FieldLabel } from "@/components/ui/field";
import { CheckIcon, ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { CurrencyOption } from "./types";

interface CurrencySelectProps {
  currencies: CurrencyOption[];
  selectedCurrency: CurrencyOption;
  onSelectCurrency: (currency: CurrencyOption) => void;
  className?: string;
}

export default function CurrencySelect({
  currencies,
  selectedCurrency,
  onSelectCurrency,
  className,
}: CurrencySelectProps) {
  const t = useTranslations("finance.quickSend");

  return (
    <Field className={className}>
      <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("currency")}
      </FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-between rounded-[10px] border-gray-300 bg-white px-4 text-sm font-normal text-gray-800 shadow-theme-xs hover:bg-gray-50/50 hover:text-gray-800 focus-visible:border-brand-300 focus-visible:ring-3 focus-visible:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:hover:bg-gray-800"
            >
              <span>{selectedCurrency.label}</span>
              <ChevronDownIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-36 min-w-0 p-1.5">
          {currencies.map((curr) => {
            const isSelected = selectedCurrency.code === curr.code;
            return (
              <DropdownMenuItem
                key={curr.code}
                onClick={() => onSelectCurrency(curr)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                  isSelected && "bg-gray-100 font-medium dark:bg-white/5",
                )}
              >
                <span>{curr.label}</span>
                {isSelected && (
                  <CheckIcon className="size-3.5 text-brand-500" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </Field>
  );
}
