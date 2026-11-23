"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import Image from "next/image";
import CardHeader from "./card-header";

export default function DeliveryStat() {
  const t = useTranslations("logistics.deliveryVehicle");

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3">
      <CardHeader />

      <div className="relative mt-5 flex justify-between">
        <div>
          <h3 className="mb-1 text-3xl font-medium text-gray-800 dark:text-white/90">
            29
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-green-600 dark:text-green-500">
              +3.85%
            </span>{" "}
            <span>{t("thanLastWeek")}</span>
          </p>

          <div className="mt-5 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-green-500 ring-inset">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-500">
                {t("onRoute")}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Image
            width={160}
            height={132}
            className="absolute -inset-e-6 -bottom-2 rtl:-scale-x-100"
            src="/images/logistics/truck.png"
            alt={t("title")}
          />
        </div>
      </div>
    </Card>
  );
}
