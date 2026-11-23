"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { StatItemConfig } from "./types";

interface StatCardProps {
  stat: StatItemConfig;
  className?: string;
}

export default function StatCard({ stat, className }: StatCardProps) {
  const t = useTranslations("hr.quickStats");
  const Icon = stat.icon;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t(stat.key)}
          </span>
          <div className={cn("size-6", stat.iconColorClass)}>
            <Icon className="size-6" />
          </div>
        </div>

        <h3 className="mt-2 text-2xl font-semibold text-gray-800 sm:text-3xl dark:text-white/90">
          {stat.value}
        </h3>
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <Badge
          variant="light"
          color={stat.isPositive ? "success" : "error"}
          size="sm"
        >
          {stat.isPositive ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )}
          <span>{stat.change}</span>
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {t(stat.comparisonKey)}
        </span>
      </div>
    </div>
  );
}
