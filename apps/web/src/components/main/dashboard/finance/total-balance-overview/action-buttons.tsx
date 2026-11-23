"use client";

import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { PlusIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "./icons";

interface ActionButtonsProps {
  onTransfer?: () => void;
  onReceived?: () => void;
  onAdd?: () => void;
  className?: string;
}

export default function ActionButtons({
  onTransfer,
  onReceived,
  onAdd,
  className,
}: ActionButtonsProps) {
  const t = useTranslations("finance.totalBalanceOverview");

  return (
    <CardFooter
      className={cn(
        "flex items-center gap-3 border-none p-0 px-1 pt-5 pb-4",
        className,
      )}
    >
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={onTransfer}
        className="h-11 flex-1 gap-2 rounded-lg text-sm font-medium"
      >
        <ArrowUpRightIcon className="size-5 rtl:-scale-x-100" />
        <span>{t("transfer")}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onReceived}
        className="h-11 flex-1 gap-2 rounded-lg border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
      >
        <ArrowDownLeftIcon className="size-5 rtl:-scale-x-100" />
        <span>{t("received")}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        onClick={onAdd}
        className="size-11 shrink-0 rounded-lg border-gray-300 bg-white text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
        aria-label="Add"
      >
        <PlusIcon className="size-5" />
      </Button>
    </CardFooter>
  );
}
