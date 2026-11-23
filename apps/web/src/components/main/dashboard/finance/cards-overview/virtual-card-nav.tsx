"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { useTranslations } from "next-intl";

interface VirtualCardNavProps {
  isBeginning: boolean;
  isEnd: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function VirtualCardNav({
  isBeginning,
  isEnd,
  onPrev,
  onNext,
}: VirtualCardNavProps) {
  const t = useTranslations("finance.myCards");

  return (
    <div className="flex items-center justify-between">
      <h4 className="text-base font-medium text-gray-800 dark:text-white/90">
        {t("virtualCard")}
      </h4>
      <div className="flex items-center gap-1.5">
        <Button
          id="card-slider-prev"
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isBeginning}
          onClick={onPrev}
          aria-label="Previous card"
          className="size-8 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          <ChevronLeftIcon className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          id="card-slider-next"
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={isEnd}
          onClick={onNext}
          aria-label="Next card"
          className="size-8 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          <ChevronRightIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
