"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies, paymentConditions } from "./constants";

interface InvoicePaymentTermsProps {
  paymentCondition: string;
  currency: string;
  onChange: (field: "paymentCondition" | "currency", value: string) => void;
}

export default function InvoicePaymentTerms({
  paymentCondition,
  currency,
  onChange,
}: InvoicePaymentTermsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Field>
        <FieldLabel>Payment Condition</FieldLabel>
        <Select
          value={paymentCondition}
          onValueChange={(val) => onChange("paymentCondition", val || "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            {paymentConditions.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Currency</FieldLabel>
        <Select
          value={currency}
          onValueChange={(val) => onChange("currency", val || "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.value} value={curr.value}>
                {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
