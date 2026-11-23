"use client";

import { InvoiceDetailsData } from "../types";
import InvoiceAdditionalInfo from "./additional-info";
import InvoiceBasicInfo from "./basic-info";
import InvoiceCustomerAddress from "./customer-address";
import InvoiceDates from "./invoice-dates";
import InvoicePaymentTerms from "./payment-terms";

interface InvoiceDetailsProps {
  data: InvoiceDetailsData;
  onChange: (field: keyof InvoiceDetailsData, value: string) => void;
}

export default function InvoiceDetails({
  data,
  onChange,
}: InvoiceDetailsProps) {
  return (
    <div className="space-y-5 p-6 sm:p-8">
      {/* Row 1: Invoice Number & Customer */}
      <InvoiceBasicInfo
        invoiceNumber={data.invoiceNumber}
        customer={data.customer}
        onChange={onChange}
      />

      {/* Row 2: Customer Address */}
      <InvoiceCustomerAddress
        customerAddress={data.customerAddress}
        onChange={(val) => onChange("customerAddress", val)}
      />

      {/* Row 3: Payment Condition & Currency */}
      <InvoicePaymentTerms
        paymentCondition={data.paymentCondition}
        currency={data.currency}
        onChange={onChange}
      />

      {/* Row 4: Issue Date & Due Date */}
      <InvoiceDates
        issueDate={data.issueDate}
        dueDate={data.dueDate}
        onChange={onChange}
      />

      {/* Row 5: Additional Info */}
      <InvoiceAdditionalInfo
        additionalInfo={data.additionalInfo}
        onChange={(val) => onChange("additionalInfo", val)}
      />
    </div>
  );
}
