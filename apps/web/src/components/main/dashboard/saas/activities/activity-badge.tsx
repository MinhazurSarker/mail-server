import { FlagIcon } from "@/icons";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { ActivityBadgeData } from "./types";

interface ActivityBadgeProps {
  badge: ActivityBadgeData;
  className?: string;
}

export default function ActivityBadge({
  badge,
  className = "",
}: ActivityBadgeProps) {
  const t = useTranslations("saas.activities");

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-green-500 dark:text-green-400",
        { className },
      )}
    >
      <FlagIcon className="size-4.5 shrink-0 text-gray-700 dark:text-gray-300" />
      <span className="text-xs leading-4.5 font-medium">
        {t(badge.textKey)}
      </span>
    </div>
  );
}
