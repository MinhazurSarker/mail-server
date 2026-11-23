"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { VerticalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";

export default function CardHeader() {
  const t = useTranslations("stocks.watchlist");

  return (
    <div className="flex items-center justify-between">
      <h3 className="font-outfit text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </h3>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-xs" />}
          aria-label="Watchlist options"
        >
          <VerticalDotsIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>{t("viewMore")}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
