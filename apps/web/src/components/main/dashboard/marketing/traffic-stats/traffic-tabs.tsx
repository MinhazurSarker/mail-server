"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { trafficTabs } from "./data";
import { TrafficPeriod } from "./types";

interface TrafficTabsProps {
  selectedPeriod: TrafficPeriod;
  onPeriodChange: (period: TrafficPeriod) => void;
}

export default function TrafficTabs({
  selectedPeriod,
  onPeriodChange,
}: TrafficTabsProps) {
  const t = useTranslations("marketing.trafficStats");

  return (
    <ButtonGroup className="w-full gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-900">
      {trafficTabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          size="sm"
          onClick={() => onPeriodChange(tab.id)}
          className={cn(
            "h-9 flex-1 text-sm font-medium transition-colors",
            selectedPeriod === tab.id
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
