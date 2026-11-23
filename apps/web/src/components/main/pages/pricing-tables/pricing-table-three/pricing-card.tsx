"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";
import { CheckLineIcon } from "../icons";
import { PricingCardProps } from "./types";

export default function PricingCard({
  plan,
  onSelect,
  className,
}: PricingCardProps) {
  const {
    name,
    subtitle,
    price,
    period,
    features,
    isCurrent,
    isRecommended,
    buttonText,
  } = plan;

  return (
    <Card
      className={cn(
        "relative row-span-3 grid grid-rows-subgrid gap-6 rounded-2xl p-6 transition-all",
        isRecommended
          ? "border-transparent bg-brand-500 text-white shadow-theme-xs dark:bg-brand-500"
          : "border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {isRecommended && (
        <div className="absolute inset-e-4 top-4 rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white">
          Recommended
        </div>
      )}

      <CardHeader className="flex flex-col justify-between gap-5 p-0">
        <div className="flex flex-col gap-1">
          <CardTitle
            className={cn(
              "text-title-lg font-semibold",
              isRecommended ? "text-white" : "text-gray-800 dark:text-white/90",
            )}
          >
            {name}
          </CardTitle>

          <CardDescription
            className={cn(
              "text-sm leading-5 font-normal",
              isRecommended
                ? "text-white/90"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            {subtitle}
          </CardDescription>
        </div>

        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "text-heading-five leading-none font-bold",
              isRecommended ? "text-white" : "text-gray-800 dark:text-white/90",
            )}
          >
            {price}
          </span>
          <span
            className={cn(
              "text-sm leading-5 font-normal",
              isRecommended
                ? "text-white/90"
                : "text-gray-500 dark:text-gray-400",
            )}
          >
            {period}
          </span>
        </div>
      </CardHeader>

      <div className="w-full">
        <Button
          disabled={isCurrent}
          onClick={() => onSelect?.(plan)}
          className={cn(
            "h-11 w-full rounded-[10px] text-sm font-medium shadow-theme-xs transition-colors",
            isCurrent &&
              "cursor-not-allowed border border-gray-300 bg-white text-gray-400 opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
            !isCurrent &&
              isRecommended &&
              "bg-white text-gray-800 hover:bg-gray-50 dark:bg-white dark:text-black",
            !isCurrent &&
              !isRecommended &&
              "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/20",
          )}
        >
          {buttonText}
        </Button>
      </div>

      <CardContent className="p-0">
        <ul className="space-y-3">
          {features.map((item, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-3 text-sm leading-5 font-normal",
                isRecommended
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              <CheckLineIcon
                className={cn(
                  "size-4 shrink-0",
                  isRecommended ? "text-white" : "text-green-500",
                )}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
