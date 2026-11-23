"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StarFilledIcon, StarIcon } from "@/icons";
import { cn } from "@/utils";
import type { MailItemProps } from "./types";

export default function MailItemComponent({
  mail,
  isChecked,
  isStarred,
  onToggleCheck,
  onToggleStar,
  onClick,
}: MailItemProps) {
  const badgeColorMap: Record<string, "error" | "success" | "primary" | "warning"> = {
    Important: "error",
    Urgent: "error",
    VIP: "primary",
    Social: "success",
    Work: "primary",
    Invoices: "warning",
    Promotional: "primary",
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 transition-colors sm:px-6 dark:border-gray-800/60 cursor-pointer select-none",
        !mail.isRead
          ? "bg-white font-semibold dark:bg-white/5"
          : "bg-gray-50/50 hover:bg-gray-100/70 dark:bg-transparent dark:hover:bg-white/5",
      )}
      onClick={onClick}
    >
      {/* Left Column: Checkbox, Star, Sender */}
      <div
        className="flex w-36 shrink-0 items-center gap-2.5 sm:w-48 sm:gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isChecked}
          onCheckedChange={(checked) => onToggleCheck(Boolean(checked))}
          aria-label={`Select email from ${mail.sender}`}
        />

        <button
          type="button"
          onClick={onToggleStar}
          aria-label="Star message"
          className="cursor-pointer text-gray-400 transition hover:text-amber-500 dark:hover:text-amber-400"
        >
          {isStarred ? (
            <StarFilledIcon className="size-4.5 text-amber-500 dark:text-amber-400" />
          ) : (
            <StarIcon className="size-4.5 text-gray-400 dark:text-gray-600" />
          )}
        </button>

        <span
          className={cn(
            "truncate text-sm text-gray-800 dark:text-white/90",
            !mail.isRead ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300",
          )}
        >
          {mail.sender}
        </span>
      </div>

      {/* Center Column: Subject + Snippet Preview + Badge */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm">
          <span
            className={cn(
              !mail.isRead
                ? "font-semibold text-gray-900 dark:text-white"
                : "font-normal text-gray-800 dark:text-white/80",
            )}
          >
            {mail.subject || "(no subject)"}
          </span>
          {mail.content && (
            <span className="text-gray-500 dark:text-gray-400">
              {" — "}
              {mail.content}
            </span>
          )}
        </p>

        {mail.badge && (
          <Badge
            variant="light"
            color={badgeColorMap[mail.badge] || "primary"}
            size="sm"
            className="hidden shrink-0 sm:inline-flex"
          >
            {mail.badge}
          </Badge>
        )}
      </div>

      {/* Right Column: Time */}
      <div className="shrink-0 text-end">
        <span
          className={cn(
            "text-xs",
            !mail.isRead
              ? "font-semibold text-gray-800 dark:text-gray-200"
              : "text-gray-400 dark:text-gray-500",
          )}
        >
          {mail.time}
        </span>
      </div>
    </div>
  );
}
