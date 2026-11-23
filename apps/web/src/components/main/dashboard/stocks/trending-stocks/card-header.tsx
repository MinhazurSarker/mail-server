"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { useTranslations } from "next-intl";

export default function CardHeader() {
  const t = useTranslations("stocks.trendingStocks");

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </CardTitle>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Previous slide"
          className="trending-stocks-prev size-8 rounded-full border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-white/3 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
        >
          <ChevronLeftIcon className="size-4 stroke-2 rtl:rotate-180" />
        </Button>

        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Next slide"
          className="trending-stocks-next size-8 rounded-full border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-white/3 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
        >
          <ChevronRightIcon className="size-4 stroke-2 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
