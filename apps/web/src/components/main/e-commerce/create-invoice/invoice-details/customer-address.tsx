"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface InvoiceCustomerAddressProps {
  customerAddress: string;
  onChange: (value: string) => void;
}

export default function InvoiceCustomerAddress({
  customerAddress,
  onChange,
}: InvoiceCustomerAddressProps) {
  return (
    <Field>
      <FieldLabel htmlFor="customer-address">Customer Address</FieldLabel>
      <Input
        id="customer-address"
        value={customerAddress}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter customer address"
      />
    </Field>
  );
}
