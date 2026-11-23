import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { defaultInvoiceData } from "./data";
import InvoiceActions from "./invoice-actions";
import InvoiceAddress from "./invoice-address";
import InvoiceHeader from "./invoice-header";
import InvoiceSummary from "./invoice-summary";
import InvoiceTable from "./invoice-table";
import { SingleInvoiceProps } from "./types";

export default function SingleInvoice({
  data = defaultInvoiceData,
  className,
  onProceedPayment,
  onPrint,
}: SingleInvoiceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <InvoiceHeader invoiceId={data.invoiceId} />

      <Separator orientation="horizontal" />

      <div className="space-y-8 p-6 sm:space-y-9 sm:p-8">
        <InvoiceAddress from={data.from} to={data.to} />

        <InvoiceTable items={data.items} />

        <InvoiceSummary summary={data.summary} />

        <InvoiceActions onProceedPayment={onProceedPayment} onPrint={onPrint} />
      </div>
    </div>
  );
}
