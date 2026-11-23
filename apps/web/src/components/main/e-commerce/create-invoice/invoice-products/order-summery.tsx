import { formatCurrency } from "./utils";

interface OrderSummaryProps {
  subtotal: number;
  vat: number;
  total: number;
}

export default function OrderSummary({
  subtotal,
  vat,
  total,
}: OrderSummaryProps) {
  return (
    <div className="mt-8 flex justify-end">
      <div className="w-full max-w-56 space-y-3 sm:max-w-64">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
          Order summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Vat (10%):</span>
            <span className="font-medium text-gray-800 dark:text-white/90">
              {formatCurrency(vat)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-medium text-gray-800 dark:text-white/90">
              Total
            </span>
            <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
