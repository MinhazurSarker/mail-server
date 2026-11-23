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
  const t = useTranslations("sales.salesByCountry");
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            />
          }
        >
          <VerticalDotsIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>{tCommon("viewMore")}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
