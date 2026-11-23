"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, HorizontalSlideIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeliveryTab } from "./types";

export interface CardHeaderProps {
  selectedTab: DeliveryTab;
  onTabChange: (tab: DeliveryTab) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (val: string) => void;
  className?: string;
}

export default function CardHeader({
  selectedTab,
  onTabChange,
  categoryFilter,
  onCategoryFilterChange,
  companyFilter,
  onCompanyFilterChange,
  className = "",
}: CardHeaderProps) {
  const t = useTranslations("logistics.deliveriesActivity");
  const [isOpen, setIsOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState(categoryFilter);
  const [tempCompany, setTempCompany] = useState(companyFilter);

  const tabs: { key: DeliveryTab; label: string }[] = [
    { key: "all", label: t("tabs.all") },
    { key: "delivered", label: t("tabs.delivered") },
    { key: "in-transit", label: t("tabs.inTransit") },
    { key: "pending", label: t("tabs.pending") },
    { key: "processing", label: t("tabs.processing") },
  ];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempCategory(categoryFilter);
      setTempCompany(companyFilter);
    }
  };

  const handleApply = () => {
    onCategoryFilterChange(tempCategory);
    onCompanyFilterChange(tempCompany);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempCategory("");
    setTempCompany("");
    onCategoryFilterChange("");
    onCompanyFilterChange("");
    setIsOpen(false);
  };

  const hasActiveFilters = Boolean(categoryFilter || companyFilter);

  return (
    <div
      className={`flex flex-col gap-4 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800 ${className}`}
    >
      <div>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
        <CardDescription className="mt-0.5 text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </CardDescription>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Tabs */}
        <div className="inline-flex h-10 w-full flex-1 gap-0.5 overflow-x-auto rounded-[10px] bg-gray-100 p-0.5 sm:w-auto lg:min-w-fit dark:bg-gray-900">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`h-9 flex-1 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap sm:text-sm lg:flex-initial ${
                selectedTab === tab.key
                  ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Date range button */}
          <Button
            variant="outline"
            className="h-10 shrink-0 gap-2 rounded-[10px] border-gray-300 px-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <CalendarIcon className="size-5" />
            <span className="hidden sm:inline">05 Feb - 06 March</span>
          </Button>

          {/* Filter button + Popover */}
          <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={`h-10 shrink-0 gap-2 rounded-[10px] border-gray-300 px-4 text-sm font-medium shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5 ${
                    hasActiveFilters
                      ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <HorizontalSlideIcon className="size-5" />
                  {t("filter.button")}
                </Button>
              }
            />
            <PopoverContent
              align="end"
              className="w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t("filter.category")}
                  </label>
                  <input
                    type="text"
                    value={tempCategory}
                    onChange={(e) => setTempCategory(e.target.value)}
                    placeholder={t("filter.searchCategory")}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t("filter.company")}
                  </label>
                  <input
                    type="text"
                    value={tempCompany}
                    onChange={(e) => setTempCompany(e.target.value)}
                    placeholder={t("filter.searchCompany")}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={handleApply}
                    className="h-9 flex-1 rounded-lg text-sm"
                  >
                    {t("filter.apply")}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="h-9 rounded-lg px-3 text-sm"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
