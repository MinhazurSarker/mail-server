"use client";

import { useTranslations } from "next-intl";
import { spendingCategories } from "./data";

export default function SpendingCategories() {
  const t = useTranslations("finance.spending");

  return (
    <div className="grid grid-cols-2 gap-3">
      {spendingCategories.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
            {t(`categories.${item.nameKey}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
