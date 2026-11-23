import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { HrHeaderProps } from "./types";

export default function HrHeader({ className, onAddMember }: HrHeaderProps) {
  const t = useTranslations("hr.header");

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="default"
          className="shadow-theme-xs border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
        >
          <CalendarIcon className="size-5 text-gray-500 dark:text-gray-400" />
          <span>{t("dateRange")}</span>
        </Button>

        <Button
          variant="default"
          size="default"
          onClick={onAddMember}
          className="shadow-theme-xs"
        >
          <PlusIcon className="size-5" />
          <span>{t("addMember")}</span>
        </Button>
      </div>
    </div>
  );
}
