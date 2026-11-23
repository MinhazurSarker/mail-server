"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { VerticalDotsIcon } from "@/icons";
import { useTranslations } from "next-intl";

export default function CardHeader() {
  const t = useTranslations("crm.salesCategory");
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </CardTitle>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <VerticalDotsIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
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
