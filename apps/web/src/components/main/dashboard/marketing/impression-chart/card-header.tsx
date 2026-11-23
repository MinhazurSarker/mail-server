"use client";

import { CalendarIcon } from "@/icons";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface CardHeaderProps {
  onDateRangeChange?: (dates: [Date, Date]) => void;
  dateRangeText?: string;
  totalRevenue?: string;
  growthRate?: string;
}

export default function CardHeader({
  onDateRangeChange,
  dateRangeText,
  totalRevenue = "$9,758.00",
  growthRate = "+7.96%",
}: CardHeaderProps) {
  const t = useTranslations("marketing.impressionChart");
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [currentDateRange, setCurrentDateRange] = useState(dateRangeText ?? "");

  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "d M",
      defaultDate: [startDate, today],
      clickOpens: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates, dateStr) => {
        setCurrentDateRange(dateStr);
        if (selectedDates.length === 2 && onDateRangeChange) {
          onDateRangeChange([selectedDates[0], selectedDates[1]]);
        }
      },
      onReady: (_selectedDates, dateStr) => {
        if (dateStr) {
          setCurrentDateRange(dateStr);
        }
      },
    });

    if (!Array.isArray(fp) && fp.setDate) {
      fp.setDate([startDate, today], false);
      if (datePickerRef.current?.value) {
        setCurrentDateRange(datePickerRef.current.value);
      }
    }

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, [onDateRangeChange]);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {currentDateRange || dateRangeText}
          </p>
        </div>

        <div className="hidden h-7 w-px bg-gray-200 sm:block dark:bg-gray-800" />

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {totalRevenue}
            </h4>

            <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-500/15 dark:text-green-500">
              {growthRate}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {t("totalRevenue")}
          </p>
        </div>
      </div>

      <div className="relative inline-flex items-center">
        <CalendarIcon className="pointer-events-none absolute inset-s-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <input
          ref={datePickerRef}
          className="h-10 w-39 cursor-pointer rounded-lg border border-gray-200 bg-white ps-10 pe-3 text-sm font-medium text-gray-700 shadow-theme-xs outline-none hover:bg-gray-50 focus:border-brand-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
          placeholder={t("selectDateRange")}
        />
      </div>
    </div>
  );
}
