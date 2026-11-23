"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PrimaryAccountProps {
  accountNumber?: string;
  onSeeDetails?: () => void;
}

export default function PrimaryAccount({
  accountNumber = "•••• •••• •••• 5332",
  onSeeDetails,
}: PrimaryAccountProps) {
  const t = useTranslations("finance.totalBalanceOverview");
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="pt-7.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="shrink-0 text-sm text-gray-700 dark:text-gray-400">
          {t("primaryAccount")}
        </p>
        <div className="flex items-center gap-2">
          <p className="shrink-0 text-lg font-medium text-gray-700 dark:text-gray-400">
            {accountNumber}
          </p>

          {/* Copy Button */}
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={handleCopy}
            className="size-8 shadow-xs hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
            aria-label="Copy account number"
          >
            {isCopied ? (
              <CheckIcon className="size-4 text-green-500" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>

          {/* Details Button */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onSeeDetails}
            className="h-8 shrink-0 px-3 text-sm shadow-xs hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            {t("seeDetails")}
          </Button>
        </div>
      </div>
    </div>
  );
}
