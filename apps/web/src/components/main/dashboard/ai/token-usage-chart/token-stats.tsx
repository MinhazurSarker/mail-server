"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { statsData } from "./data";

export default function TokenStats() {
  const t = useTranslations("aiDashboard.apiToken");

  return (
    <div className="pt-1.25">
      <ul className="divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-800 dark:border-gray-800">
        {statsData.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between px-4 py-3"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800">
                  <Icon className={item.iconClassName} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("configuredKey", { count: item.keyCount })}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-end">
                <div className="flex items-center justify-end gap-1">
                  <span
                    className={cn("size-1.25 rounded-full", item.dotColor)}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                    {item.usage}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("tokenUsed")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <Button variant="ghost" className="my-2.5 w-full">
        {t("viewAllUsageDetails")}
      </Button>
    </div>
  );
}
