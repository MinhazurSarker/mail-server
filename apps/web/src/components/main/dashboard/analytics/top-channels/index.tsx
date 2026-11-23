"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import ChannelRow from "./channel-row";
import { topChannelsData } from "./data";
import { TopChannelsProps } from "./types";

export default function TopChannel({
  data = topChannelsData,
  className,
}: TopChannelsProps) {
  const t = useTranslations("analytics.topChannels");
  const tCommon = useTranslations("common");

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" />}
          >
            <HorizontalDotsIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>{tCommon("viewMore")}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="my-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <span className="text-xs text-gray-400">{t("source")}</span>
          <span className="text-end text-xs text-gray-400">
            {t("visitors")}
          </span>
        </div>

        {data.map((channel) => (
          <ChannelRow key={channel.id} channel={channel} />
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full"
        nativeButton={false}
        render={<Link href="#" />}
      >
        {t("channelsReport")}
        <ArrowRightIcon className="rtl:rotate-180" />
      </Button>
    </div>
  );
}
