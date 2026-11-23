"use client";

import { cn } from "@/utils";
import CardHeader from "./card-header";
import CountryList from "./country-list";
import CountryMap from "./country-map";

interface SalesByCountryProps {
  className?: string;
}

export default function SalesByCountry({ className }: SalesByCountryProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader />
      <div className="my-4">
        <CountryMap />
      </div>
      <CountryList />
    </div>
  );
}
