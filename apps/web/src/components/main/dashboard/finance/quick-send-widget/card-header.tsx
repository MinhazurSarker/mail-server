"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

interface QuickSendHeaderProps {
  className?: string;
}

export default function QuickSendHeader({ className }: QuickSendHeaderProps) {
  const t = useTranslations("finance.quickSend");

  return (
    <CardHeader className={cn("p-0", className)}>
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </CardTitle>
    </CardHeader>
  );
}
