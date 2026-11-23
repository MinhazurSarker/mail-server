"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "@/icons";
import flatpickr from "flatpickr";
import { useEffect, useRef } from "react";

interface InvoiceDatesProps {
  issueDate: string;
  dueDate: string;
  onChange: (field: "issueDate" | "dueDate", value: string) => void;
}

export default function InvoiceDates({
  issueDate,
  dueDate,
  onChange,
}: InvoiceDatesProps) {
  const issueDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let issueFp: flatpickr.Instance | undefined;
    let dueFp: flatpickr.Instance | undefined;

    if (issueDateRef.current) {
      issueFp = flatpickr(issueDateRef.current, {
        mode: "single",
        dateFormat: "d F, Y",
        defaultDate: issueDate || undefined,
        onChange: (_selectedDates, dateStr) => {
          onChange("issueDate", dateStr);
        },
      });
    }

    if (dueDateRef.current) {
      dueFp = flatpickr(dueDateRef.current, {
        mode: "single",
        dateFormat: "d F, Y",
        defaultDate: dueDate || undefined,
        onChange: (_selectedDates, dateStr) => {
          onChange("dueDate", dateStr);
        },
      });
    }

    return () => {
      issueFp?.destroy();
      dueFp?.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="issue-date">Issue Date</FieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="size-5" />
          </span>
          <Input
            ref={issueDateRef}
            id="issue-date"
            defaultValue={issueDate}
            placeholder="Select date"
            className="ps-11"
          />
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="due-date">Due Date</FieldLabel>
        <div className="relative">
          <span className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="size-5" />
          </span>
          <Input
            ref={dueDateRef}
            id="due-date"
            defaultValue={dueDate}
            placeholder="Select date"
            className="ps-11"
          />
        </div>
      </Field>
    </div>
  );
}
