"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import CardHeader from "./card-header";
import { trafficSourceData } from "./data";
import SourceItem from "./source-item";

export default function TrafficSource() {
  const t = useTranslations("marketing.trafficSource");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="mt-6">
        {trafficSourceData.map((source, index) => (
          <SourceItem
            key={source.id}
            source={source}
            isLast={index === trafficSourceData.length - 1}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="lg"
        nativeButton={false}
        render={<Link href="#" />}
        className="mt-6 w-full"
      >
        {t("viewAll")}
      </Button>
    </div>
  );
}
