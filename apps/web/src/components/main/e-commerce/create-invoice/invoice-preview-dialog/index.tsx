"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InvoiceDetailsData, InvoiceItem } from "../types";
import PreviewAddressInfo from "./preview-address-info";
import PreviewHeader from "./preview-header";
import PreviewItemsTable from "./preview-items-table";
import PreviewOrderSummary from "./preview-order-summary";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: InvoiceDetailsData;
  items: InvoiceItem[];
}

export default function InvoicePreviewDialog({
  open,
  onOpenChange,
  details,
  items,
}: InvoicePreviewDialogProps) {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-3xl sm:p-8"
        showCloseButton={true}
      >
        <PreviewHeader invoiceNumber={details.invoiceNumber} />
        <PreviewAddressInfo details={details} />
        <PreviewItemsTable items={items} />
        <PreviewOrderSummary subtotal={subtotal} vat={vat} total={total} />
      </DialogContent>
    </Dialog>
  );
}
