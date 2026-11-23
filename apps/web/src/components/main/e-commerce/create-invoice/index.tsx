"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, FloppyDiscIcon } from "@/icons";
import { useState } from "react";
import { initialDetails, initialItems } from "./data";
import InvoiceDetails from "./invoice-details";
import InvoicePreviewDialog from "./invoice-preview-dialog";
import InvoiceProducts from "./invoice-products";
import { InvoiceDetailsData, InvoiceItem } from "./types";

export default function CreateInvoice() {
  const [details, setDetails] = useState<InvoiceDetailsData>(initialDetails);
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDetailsChange = (
    field: keyof InvoiceDetailsData,
    value: string,
  ) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (newItem: Omit<InvoiceItem, "id" | "total">) => {
    const rawTotal = newItem.quantity * newItem.unitCost;
    const discountedTotal = rawTotal - (rawTotal * newItem.discount) / 100;

    const itemWithId: InvoiceItem = {
      ...newItem,
      id: Date.now().toString(),
      total: Math.round(discountedTotal),
    };

    setItems((prev) => [...prev, itemWithId]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Topbar */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h2 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          Create Invoice
        </h2>
      </div>

      {/* Invoice Meta Section */}
      <InvoiceDetails data={details} onChange={handleDetailsChange} />

      {/* Divider */}
      <Separator />

      {/* Line Items Table & Add Product */}
      <InvoiceProducts
        items={items}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* Bottom Action Footer */}
      <div className="border-t border-gray-200 p-6 sm:p-8 dark:border-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap sm:w-auto"
          >
            <EyeIcon className="size-5" />
            Preview Invoice
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              // Could persist or alert
              console.log("Saving invoice:", { details, items });
            }}
            className="flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap sm:w-auto"
          >
            <FloppyDiscIcon className="size-5" />
            Save Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Preview Dialog */}
      <InvoicePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        details={details}
        items={items}
      />
    </div>
  );
}
