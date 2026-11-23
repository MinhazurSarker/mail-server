"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export interface CardHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSeeAllClick?: () => void;
  className?: string;
}

export default function CardHeader({
  searchQuery = "",
  onSearchChange,
  onSeeAllClick,
  className = "",
}: CardHeaderProps) {
  const t = useTranslations("sales.topProducts");
  const tCommon = useTranslations("common");

  return (
    <div
      className={`flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${className}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-10 w-full sm:w-55"
        />

        <Button
          variant="outline"
          onClick={onSeeAllClick}
          className="h-10 shrink-0 font-medium"
        >
          {tCommon("seeAll")}
        </Button>
      </div>
    </div>
  );
}
