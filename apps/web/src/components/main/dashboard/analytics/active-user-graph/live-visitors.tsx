"use client";

import { useTranslations } from "next-intl";

interface LiveVisitorsProps {
  count?: number | string;
}

export default function LiveVisitors({ count = 364 }: LiveVisitorsProps) {
  const t = useTranslations("analytics.activeUsers");

  return (
    <div className="mt-6 flex items-end gap-1.5">
      <div className="flex items-center gap-2.5">
        <span className="relative inline-block h-5 w-5">
          <span className="absolute inset-s-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500 rtl:translate-x-1/2">
            <span className="absolute -inset-s-1 -top-1 inline-flex h-4 w-4 animate-ping rounded-full bg-red-400 opacity-75" />
          </span>
        </span>

        <span className="activeUsers text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {count}
        </span>
      </div>
      <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">
        {t("liveVisitors")}
      </span>
    </div>
  );
}
