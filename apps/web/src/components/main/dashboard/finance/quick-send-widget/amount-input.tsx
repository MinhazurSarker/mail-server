"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AmountInput({
  value,
  onChange,
  className,
}: AmountInputProps) {
  const t = useTranslations("finance.quickSend");

  return (
    <Field className={className}>
      <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("amount")}
      </FieldLabel>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
      />
    </Field>
  );
}
