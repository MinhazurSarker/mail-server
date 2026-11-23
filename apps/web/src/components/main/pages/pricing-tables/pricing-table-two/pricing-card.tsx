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
import * as React from "react";
import { CheckLineIcon, CloseLineIcon } from "../icons";
import { PricingCardProps } from "./types";

export default function PricingCard({
  plan,
  onSelect,
  className,
}: PricingCardProps) {
  const {
    name,
    price,
    period,
    description,
    features,
    icon,
    isPopular,
    buttonText,
  } = plan;

  return (
    <Card
      className={cn(
        "grid grid-rows-subgrid row-span-4 gap-6 rounded-2xl p-6 sm:p-8 transition-all",
        isPopular
          ? "border-2 border-brand-500 bg-white dark:border-brand-500 dark:bg-white/3"
          : "border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader className="gap-0 p-0">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-title-lg font-semibold text-gray-800 dark:text-white/90">
              {name}
            </CardTitle>

            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-1">
                <span className="text-heading-four font-bold leading-none text-gray-800 dark:text-white/90">
                  {price}
                </span>
                <span className="pb-1 text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">
                  {period}
                </span>
              </div>

              <CardDescription className="text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">
                {description}
              </CardDescription>
            </div>
          </div>

          {icon && (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[10.5px] bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>

      <Separator className="my-0 dark:bg-gray-800" />

      <CardContent className="p-0">
        <ul className="space-y-3">
          {features.map((item, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-3 text-sm font-normal leading-5",
                item.included
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-400 dark:text-gray-600",
              )}
            >
              {item.included ? (
                <CheckLineIcon className="size-4 shrink-0 text-green-500" />
              ) : (
                <CloseLineIcon className="size-4 shrink-0 text-gray-400 dark:text-gray-600" />
              )}
              <span>{item.name}</span>
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
