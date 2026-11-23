"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { VerticalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";

export default function CardHeader() {
  const t = useTranslations("logistics.revenueEarned");
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-start justify-between">
      <div>
        <CardDescription className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("totalRevenue")}
        </CardDescription>
        <CardTitle className="mb-0 text-3xl font-medium text-gray-800 dark:text-white/90">
          $23,445,700
        </CardTitle>
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
