import { cn } from "@/utils";
import { InvoiceHeaderProps } from "./types";

export default function InvoiceHeader({
  title = "Invoice",
  invoiceId = "#34834",
  className,
}: InvoiceHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 sm:py-5",
        className,
      )}
    >
      <h3 className="text-title-sm sm:text-title-md font-medium text-gray-800 dark:text-white/90">
        {title}
      </h3>
      <p className="text-sm sm:text-base font-normal text-gray-700 dark:text-gray-300">
        ID : {invoiceId}
      </p>
    </div>
  );
}
