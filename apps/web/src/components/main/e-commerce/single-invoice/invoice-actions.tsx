"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PrinterIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceActionsProps } from "./types";

export default function InvoiceActions({
  onProceedPayment,
  onPrint,
  className,
}: InvoiceActionsProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Separator orientation="horizontal" className="mb-6" />
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onProceedPayment}
        >
          Proceed to payment
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handlePrint}
        >
          <PrinterIcon />
          Print
        </Button>
      </div>
    </div>
  );
}
