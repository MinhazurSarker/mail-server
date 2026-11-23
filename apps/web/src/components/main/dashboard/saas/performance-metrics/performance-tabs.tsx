"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { performanceTabs } from "./data";
import { PerformanceTab } from "./types";

interface PerformanceTabsProps {
  selectedTab: PerformanceTab;
  onTabChange: (tab: PerformanceTab) => void;
}

export default function PerformanceTabs({
  selectedTab,
  onTabChange,
}: PerformanceTabsProps) {
  const t = useTranslations("saas.productPerformance");

  return (
    <ButtonGroup className="mt-1 w-full gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-900">
      {performanceTabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "h-9 flex-1 text-sm font-medium transition-colors",
            selectedTab === tab.id
              ? "bg-white text-gray-900 shadow-theme-xs hover:bg-white hover:text-gray-900 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
              : "text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white",
          )}
        >
          {t(tab.labelKey)}
        </Button>
      ))}
    </ButtonGroup>
  );
}
