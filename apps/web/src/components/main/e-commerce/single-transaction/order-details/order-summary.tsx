import { OrderSummaryData } from "./types";

interface OrderSummaryProps {
  summary: OrderSummaryData;
}

export default function OrderSummary({ summary }: OrderSummaryProps) {
  return (
    <div className="flex w-full flex-col items-end pt-6">
      <div className="flex w-55 flex-col gap-4">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
          Order summary
        </h4>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-5 leading-5">
            <span className="w-30 text-gray-500 dark:text-gray-400">
              Subtotal
            </span>
            <span className="text-end font-medium text-gray-700 dark:text-gray-300">
              ${summary.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5 leading-5">
            <span className="w-30 text-gray-500 dark:text-gray-400">
              Vat ({summary.vatRate}%):
            </span>
            <span className="text-end font-medium text-gray-700 dark:text-gray-300">
              ${summary.vatAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-5 pt-1">
            <span className="w-30 text-base font-medium text-gray-700 dark:text-gray-300">
              Total
            </span>
            <span className="text-end text-title-sm font-semibold text-gray-800 dark:text-white/90">
              ${summary.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
