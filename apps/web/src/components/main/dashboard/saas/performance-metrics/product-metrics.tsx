"use client";

import { Separator } from "@/components/ui/separator";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { ProductMetric } from "./types";

interface ProductMetricsProps {
  digitalProduct: ProductMetric;
  physicalProduct: ProductMetric;
}

export default function ProductMetrics({
  digitalProduct,
  physicalProduct,
}: ProductMetricsProps) {
  const t = useTranslations("saas.productPerformance");

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/3">
      {/* Digital Product */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("digitalProduct")}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full",
              digitalProduct.isPositive
                ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
            )}
          >
            {digitalProduct.isPositive ? (
              <ArrowUpIcon className="size-3" />
            ) : (
              <ArrowDownIcon className="size-3" />
            )}
          </span>
          <span className="text-xl font-bold text-gray-800 dark:text-white/90">
            {digitalProduct.value}
          </span>
        </div>
      </div>

      {/* Center Divider */}
      <Separator orientation="vertical" />

      {/* Physical Product */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("physicalProduct")}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full",
              physicalProduct.isPositive
                ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
            )}
          >
            {physicalProduct.isPositive ? (
              <ArrowUpIcon className="size-3" />
            ) : (
              <ArrowDownIcon className="size-3" />
            )}
          </span>
          <span className="text-xl font-bold text-gray-800 dark:text-white/90">
            {physicalProduct.value}
          </span>
        </div>
      </div>
    </div>
  );
}
