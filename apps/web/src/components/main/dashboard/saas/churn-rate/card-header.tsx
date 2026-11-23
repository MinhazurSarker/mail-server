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
  const t = useTranslations("saas.churnRate");

  return (
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="mb-0 text-title-sm font-medium text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
        <CardDescription className="mt-0.5 text-sm font-normal text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </CardDescription>
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
          <DropdownMenuItem>{t("viewMore")}</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
