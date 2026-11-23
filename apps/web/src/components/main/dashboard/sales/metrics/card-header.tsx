"use client";

import { Button } from "@/components/ui/button";
import { CalendarIcon, HorizontalSlideIcon, UploadIcon } from "@/icons";
import { cn } from "@/utils";
import flatpickr from "flatpickr";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { CardHeaderProps } from "./types";

export default function CardHeader({
  title,
  subtitle,
  className,
  onFilter,
  onExport,
}: CardHeaderProps) {
  const t = useTranslations("sales.salesStats");
  const tCommon = useTranslations("common");
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "mb-5 flex flex-col justify-between gap-5 sm:flex-row",
        className,
      )}
    >
      <div>
        <h2 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
          {title ?? t("title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle ?? t("subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-3 lg:flex-row">
        {/* Date input */}
        <div className="relative hidden items-center xl:inline-flex">
          <CalendarIcon className="pointer-events-none absolute inset-s-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-gray-500 lg:inset-s-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 rtl:translate-x-1/2 lg:rtl:translate-x-0 dark:text-gray-400" />
          <input
            ref={datePickerRef}
            className="h-11 w-11 cursor-pointer rounded-lg border border-gray-300 bg-white text-sm font-medium text-transparent outline-none lg:h-auto lg:w-40 lg:py-2 lg:ps-10 lg:pe-3 lg:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300"
            placeholder={t("selectDateRange")}
          />
        </div>

        <Button variant="outline" onClick={onFilter}>
          <HorizontalSlideIcon />
          {tCommon("filter")}
        </Button>

        <Button variant="default" onClick={onExport}>
          <UploadIcon />
          {t("export")}
        </Button>
      </div>
    </div>
  );
}

