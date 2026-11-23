"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { useTranslations } from "next-intl";
import { ScheduleItem } from "./types";

interface ScheduleItemRowProps {
  item: ScheduleItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export default function ScheduleItemRow({
  item,
  checked,
  onToggle,
}: ScheduleItemRowProps) {
  const t = useTranslations("crm.upcomingSchedule");

  return (
    <Field
      orientation="horizontal"
      className="cursor-pointer items-center gap-9 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-slot=checkbox]") || target.closest("label")) {
          return;
        }
        onToggle(!checked);
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={item.id}
          checked={checked}
          onCheckedChange={(val) => onToggle(val === true)}
        />
        <FieldLabel
          htmlFor={item.id}
          className="cursor-pointer flex-col gap-0 font-normal"
        >
          <span className="mb-0.5 block text-xs text-gray-500 dark:text-gray-400">
            {item.date}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            {item.time}
          </span>
        </FieldLabel>
      </div>

      <FieldContent>
        <FieldTitle className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
          {t(item.titleKey)}
        </FieldTitle>
        <FieldDescription className="text-xs text-gray-500 dark:text-gray-400">
          {t(item.descriptionKey)}
        </FieldDescription>
      </FieldContent>
    </Field>
  );
}
