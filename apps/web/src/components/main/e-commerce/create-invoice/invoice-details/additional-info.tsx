"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceAdditionalInfoProps {
  additionalInfo: string;
  onChange: (value: string) => void;
}

export default function InvoiceAdditionalInfo({
  additionalInfo,
  onChange,
}: InvoiceAdditionalInfoProps) {
  return (
    <Field>
      <FieldLabel htmlFor="additional-info">Additional Info</FieldLabel>
      <Textarea
        id="additional-info"
        value={additionalInfo}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Receipt Info (optional)"
        className="min-h-24 sm:min-h-32"
      />
    </Field>
  );
}
