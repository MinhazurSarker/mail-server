"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { CheckLineIcon } from "../icons";
import { PricingCardProps } from "./types";

export default function PricingCard({
  plan,
  isMonthly,
  onSelect,
  className,
}: PricingCardProps) {
  const {
    name,
    monthlyPrice,
    annualPrice,
    monthlyDiscountPrice,
    annualDiscountPrice,
    description,
    features,
    isPopular,
    buttonText,
  } = plan;

  const currentPrice = isMonthly ? monthlyPrice : annualPrice;
  const originalPrice = isMonthly ? monthlyDiscountPrice : annualDiscountPrice;

  return (
    <Card
      className={cn(
        "row-span-4 grid grid-rows-subgrid gap-6 rounded-2xl p-6 transition-all",
        isPopular
          ? "border-gray-800 bg-gray-800 dark:border-white/10 dark:bg-white/10"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader className="gap-3 p-0">
        <CardTitle
          className={cn(
            "text-title-lg font-semibold",
            isPopular ? "text-white" : "text-gray-800 dark:text-white/90",
          )}
        >
          {name}
        </CardTitle>

        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-0.5">
              <span
                className={cn(
                  "text-heading-four leading-none font-bold",
                  isPopular ? "text-white" : "text-gray-800 dark:text-white/90",
                )}
              >
                ${currentPrice}
              </span>
              <span
                className={cn(
                  "pb-1 text-sm leading-5 font-normal",
                  isPopular
                    ? "text-white/70"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                /{isMonthly ? "month" : "year"}
              </span>
            </div>

            <span
              className={cn(
                "pb-1 text-title-lg leading-none font-semibold line-through",
                isPopular
                  ? "text-white/70"
                  : "text-gray-400 dark:text-gray-500",
              )}
            >
              ${originalPrice}
            </span>
          </div>

          <CardDescription
            className={cn(
              "text-sm leading-5 font-normal",
              isPopular ? "text-white/70" : "text-gray-500 dark:text-gray-400",
            )}
          >
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <Separator
        className={cn(
          "my-0",
          isPopular
            ? "bg-white/20 dark:bg-white/10"
            : "bg-gray-200 dark:bg-gray-800",
        )}
      />

      <CardContent className="p-0">
        <ul className="space-y-3">
          {features.map((item, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-3 text-sm leading-5 font-normal",
                isPopular
                  ? "text-white/80"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              <CheckLineIcon className="size-4 shrink-0 text-green-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="border-none p-0 pt-2">
        <Button
          onClick={() => onSelect?.(plan)}
          className={cn(
            "h-11 w-full rounded-[10px] text-sm font-medium shadow-theme-xs transition-colors",
            isPopular
              ? "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/20"
              : "bg-gray-800 text-white hover:bg-brand-500 hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-brand-600",
          )}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
