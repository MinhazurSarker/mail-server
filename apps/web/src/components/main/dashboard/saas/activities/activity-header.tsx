"use client";

import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import * as React from "react";

interface ActivityHeaderProps {
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function ActivityHeader({
  title,
  action,
  className = "",
}: ActivityHeaderProps) {
  const t = useTranslations("saas.activities");

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {title ?? t("title")}
      </h3>
      {action && <div>{action}</div>}
    </div>
  );
}
