import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { defaultInvoiceData } from "./data";
import { InvoiceAddressProps } from "./types";

export default function InvoiceAddress({
  from = defaultInvoiceData.from,
  to = defaultInvoiceData.to,
  className,
}: InvoiceAddressProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6",
        className,
      )}
    >
      {/* From Address */}
      <div className="flex flex-col gap-4 text-start">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {from.label}
            </span>
            <p className="text-base font-semibold text-gray-800 dark:text-white/90">
              {from.name}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 leading-5">
            {from.addressLines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm leading-5">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {from.dateLabel}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {from.date}
          </span>
        </div>
      </div>

      {/* Responsive Separator */}
      <Separator
        orientation="vertical"
        className="hidden sm:block self-stretch"
      />
      <Separator orientation="horizontal" className="sm:hidden" />

      {/* To Address */}
      <div className="flex flex-col gap-4 text-start sm:text-end sm:items-end">
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-col gap-1 sm:items-end">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {to.label}
            </span>
            <p className="text-base font-semibold text-gray-800 dark:text-white/90">
              {to.name}
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 leading-5 sm:text-end">
            {to.addressLines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-sm leading-5 sm:items-end">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {to.dateLabel}
          </span>
          <span className="text-gray-500 dark:text-gray-400 sm:text-end">
            {to.date}
          </span>
        </div>
      </div>
    </div>
  );
}
