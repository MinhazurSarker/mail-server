"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HorizontalSlideIcon, SearchIcon } from "@/icons";
import { useTranslations } from "next-intl";

export interface CardHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
}

export default function CardHeader({
  searchQuery = "",
  onSearchChange,
  onFilterClick,
  className = "",
}: CardHeaderProps) {
  const t = useTranslations("finance.transactionsTable");

  return (
    <div
      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${className}`}
    >
      <div>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
      </div>

      <div className="flex w-full items-center gap-3 sm:w-auto">
        <InputGroup className="h-10 flex-1 sm:w-80 sm:flex-initial">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-5 text-gray-400" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </InputGroup>

        <Button
          variant="outline"
          onClick={onFilterClick}
          className="h-10 shrink-0 gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-400"
        >
          <HorizontalSlideIcon className="size-5" />
          <span>{t("filter")}</span>
        </Button>
      </div>
    </div>
  );
}
