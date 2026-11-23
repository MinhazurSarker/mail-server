"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface InvoiceBasicInfoProps {
  invoiceNumber: string;
  customer: string;
  onChange: (field: "invoiceNumber" | "customer", value: string) => void;
}

export default function InvoiceBasicInfo({
  invoiceNumber,
  customer,
  onChange,
}: InvoiceBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="invoice-number">Invoice Number</FieldLabel>
        <Input
          id="invoice-number"
          value={invoiceNumber}
          onChange={(e) => onChange("invoiceNumber", e.target.value)}
          placeholder="WP-3434434"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="customer-name">Customer</FieldLabel>
        <Input
          id="customer-name"
          value={customer}
          onChange={(e) => onChange("customer", e.target.value)}
          placeholder="Jhon Deniyal"
        />
      </Field>
    </div>
  );
}
