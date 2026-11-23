"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { HorizontalSlideIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import type { MetricsHeaderProps, Timeframe } from "./types";

export default function MetricsHeader({
  title,
  timeframe,
  onTimeframeChange,
  onFilterClick,
  className,
  children,
}: MetricsHeaderProps) {
  const t = useTranslations("saas.metrics");

  const timeframes: Timeframe[] = ["weekly", "monthly", "yearly"];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title ?? t("overview")}
        </h3>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {children ? (
          children
        ) : (
          <>
            <ButtonGroup className="inline-flex h-10 w-full items-center rounded-[10px] bg-gray-100 p-0.5 sm:w-auto dark:bg-gray-800">
              {timeframes.map((tf) => {
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => onTimeframeChange(tf)}
                    className={cn(
                      "inline-flex h-full flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors select-none sm:flex-auto",
                      isActive
                        ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white",
                    )}
                  >
                    {t(tf)}
                  </button>
                );
              })}
            </ButtonGroup>

            <Button
              variant="outline"
              size="default"
              onClick={onFilterClick}
              className="h-10 rounded-[10px] border-gray-300 px-4 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <HorizontalSlideIcon className="size-5 text-gray-500 dark:text-gray-400" />
              <span>{t("filter")}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
