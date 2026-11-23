"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { StatisticTab, statisticTabs } from "./data";

interface CardHeaderProps {
  selectedTab: StatisticTab;
  onTabChange: (tab: StatisticTab) => void;
}

export default function CardHeader({
  selectedTab,
  onTabChange,
}: CardHeaderProps) {
  const t = useTranslations("aiDashboard.userRevenue");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <ButtonGroup className="gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-900">
        {statisticTabs.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            onClick={() => onTabChange(tab)}
            className={cn(
              "h-8 px-3 text-sm font-medium transition-colors",
              selectedTab === tab
                ? "bg-white text-gray-900 shadow-theme-xs hover:bg-white hover:text-gray-900 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
                : "text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white",
            )}
          >
            {t(tab)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
