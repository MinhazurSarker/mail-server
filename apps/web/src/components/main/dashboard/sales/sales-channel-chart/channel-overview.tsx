"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { CHANNELS } from "./data";

export default function ChannelOverview() {
  const t = useTranslations("sales.salesByChannel");

  return (
    <div className="mt-5 rounded-xl border border-gray-100 dark:border-gray-800">
      {/* Legend / Indicators */}
      <div className="flex flex-wrap items-center gap-6 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        {CHANNELS.map((channel) => (
          <div key={channel.id} className="flex items-center gap-1.5">
            <span
              className={`inline-block size-2 rounded-full ${channel.dotColorClass}`}
            />
            <span className="text-sm text-gray-700 dark:text-gray-400">
              {t(channel.labelKey)}
            </span>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-2 text-start text-sm font-normal text-gray-400 dark:text-gray-500">
                {t("table.channels")}
              </th>
              <th className="pb-2 text-start text-sm font-normal text-gray-400 dark:text-gray-500">
                {t("table.metric")}
              </th>
              <th className="pb-2 text-end text-sm font-normal text-gray-400 dark:text-gray-500">
                {t("table.total")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-transparent">
            {CHANNELS.map((channel) => (
              <tr key={channel.id}>
                <td className="py-2 text-start text-sm text-gray-700 dark:text-gray-400">
                  {t(channel.labelKey)}
                </td>
                <td className="py-2 text-start text-sm text-gray-700 dark:text-gray-400">
                  {channel.metric}
                </td>
                <td className="py-2 text-end text-sm">
                  <div className="flex items-center justify-end gap-1">
                    {channel.isIncrease ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-500">
                        <ArrowUpIcon className="size-3.5 rotate-45 rtl:-rotate-45" />
                        {channel.change}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-500">
                        <ArrowDownIcon className="size-3.5 rotate-45 rtl:-rotate-45" />
                        {channel.change}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
