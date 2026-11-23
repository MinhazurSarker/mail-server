"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import ActivityBadge from "./activity-badge";
import { ActivityItem as ActivityItemType } from "./types";

interface ActivityItemRowProps {
  item: ActivityItemType;
  isLast?: boolean;
}

export default function ActivityItemRow({
  item,
  isLast = false,
}: ActivityItemRowProps) {
  const t = useTranslations("saas.activities");

  return (
    <div className="relative flex items-start gap-5.5">
      {/* Timeline connector line */}
      {!isLast && (
        <span
          className="absolute inset-s-5 top-13 -bottom-3 w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-800"
          aria-hidden="true"
        />
      )}

      {/* Avatar */}
      <Avatar className="relative z-10 size-10 shrink-0">
        <AvatarImage src={item.user.avatar} alt={item.user.name} />
        <AvatarFallback>{item.user.name.slice(0, 2)}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2">
          {item.badge && <ActivityBadge badge={item.badge} />}
          <p className="text-sm leading-5 font-medium text-gray-800 dark:text-white/90">
            <span>{item.user.name} </span>
            <span className="font-normal text-gray-500 dark:text-gray-400">
              {t(item.actionKey)} {item.target}
            </span>
          </p>
        </div>
        <p className="text-xs leading-4.5 font-normal text-gray-400 dark:text-gray-500">
          {item.timestamp}
        </p>
      </div>
    </div>
  );
}
