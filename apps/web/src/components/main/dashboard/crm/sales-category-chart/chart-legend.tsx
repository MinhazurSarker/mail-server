"use client";

import { useTranslations } from "next-intl";
import { SalesCategoryItem } from "./types";

interface ChartLegendItemProps {
  item: SalesCategoryItem;
}

export function ChartLegendItem({ item }: ChartLegendItemProps) {
  const t = useTranslations("crm.salesCategory");

  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${item.dotClass}`}
        aria-hidden="true"
      />
      <div>
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {t(item.titleKey)}
        </h4>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {item.percentage}%
          </span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span>
            {item.productsCount.toLocaleString()} {t("products")}
          </span>
        </p>
      </div>
    </div>
  );
}

interface ChartLegendProps {
  items: SalesCategoryItem[];
}

export default function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <ChartLegendItem key={item.id} item={item} />
      ))}
    </div>
  );
}
