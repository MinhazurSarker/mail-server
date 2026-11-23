"use client";

import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "@/icons";
import { useTranslations } from "next-intl";

interface CardsOverviewHeaderProps {
  onAddCard?: () => void;
}

export default function CardsOverviewHeader({
  onAddCard,
}: CardsOverviewHeaderProps) {
  const t = useTranslations("finance.myCards");

  return (
    <CardHeader className="mb-6 flex-row items-center justify-between gap-2">
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </CardTitle>
      <CardAction className="col-auto row-auto self-auto justify-self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddCard}
          className="h-9 gap-1.5 rounded-lg border-gray-300 px-3 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          <PlusIcon className="size-5" />
          <span>{t("addCard")}</span>
        </Button>
      </CardAction>
    </CardHeader>
  );
}
