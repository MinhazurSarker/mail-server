"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { countrySalesData } from "./data";

export default function CountryList() {
  const t = useTranslations("sales.salesByCountry.countries");

  return (
    <ul className="space-y-4">
      {countrySalesData.map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src={item.flag}
              alt={t(item.nameKey)}
              width={16}
              height={16}
              className="size-4 rounded-full object-cover"
            />
            <span className="text-sm font-normal text-gray-800 dark:text-white/90">
              {t(item.nameKey)}
            </span>
          </div>

          <div className="flex items-center gap-10">
            <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
              {item.value}
            </span>
            <span className="w-8 text-end text-sm font-normal text-gray-700 dark:text-gray-400">
              {item.percentage}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
