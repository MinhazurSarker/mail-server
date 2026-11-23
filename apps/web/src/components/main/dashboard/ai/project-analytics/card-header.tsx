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
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { CardHeaderProps } from "./types";

export default function CardHeader({
  title,
  subtitle,
  onViewMore,
  onDelete,
  className,
}: CardHeaderProps) {
  const t = useTranslations("aiDashboard.projectAnalytics");
  const tCommon = useTranslations("common");

  return (
    <div className={cn("mb-5 flex items-start justify-between", className)}>
      <div>
        <CardTitle className="mb-1 text-base font-medium text-gray-800 dark:text-white/90">
          {title ?? t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle ?? t("subtitle")}
        </CardDescription>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Options"
            />
          }
        >
          <VerticalDotsIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={onViewMore}>
            {tCommon("viewMore")}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
