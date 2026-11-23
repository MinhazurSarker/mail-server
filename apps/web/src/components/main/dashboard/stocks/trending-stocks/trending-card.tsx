"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { TrendingStockCardProps } from "./types";

export type { TrendingStockCardProps };

export default function TrendingCard({
  symbol,
  companyName,
  price,
  change,
  direction = "up",
  logoBg,
  icon,
  className,
}: TrendingStockCardProps) {
  const t = useTranslations("stocks.trendingStocks");

  return (
    <div
      className={cn("rounded-2xl bg-gray-100 p-5 dark:bg-white/3", className)}
    >
      <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: logoBg }}
            >
              {icon}
            </div>
          )}

          <div>
            <h3 className="font-outfit text-base font-semibold text-gray-800 dark:text-white/90">
              {symbol}
            </h3>
            <span className="block font-outfit text-xs text-gray-500 dark:text-gray-400">
              {companyName}
            </span>
          </div>
        </div>

        <div>
          <div>
            <h4 className="mb-1 text-end font-outfit text-sm font-medium text-gray-700 dark:text-gray-400">
              {price}
            </h4>
          </div>

          <span
            className={cn(
              "flex items-center justify-end gap-1 font-outfit text-xs font-medium",
              direction === "down"
                ? "text-red-600 dark:text-red-500"
                : "text-green-600 dark:text-green-500",
            )}
          >
            {direction === "down" ? (
              <ArrowDownIcon className="size-3.5 rotate-45" />
            ) : (
              <ArrowUpIcon className="size-3.5 rotate-45" />
            )}
            {change}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1">
          {t("shortStock")}
        </Button>

        <Button variant="default" className="flex-1">
          {t("buyStock")}
        </Button>
      </div>
    </div>
  );
}
