"use client";

import { Button } from "@/components/ui/button";

const invoices = [
  { id: "INV-2026-004", amount: "$29", date: "Nov 12, 2026" },
  { id: "INV-2026-005", amount: "$49", date: "May 12, 2026" },
  { id: "INV-2026-006", amount: "$49", date: "Feb 12, 2026" },
];

export default function PaymentMethod() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Payment Method
      </h2>

      <div className="rounded-2xl border border-gray-100 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
        {/* Card Details */}
        <div className="flex flex-col gap-3 rounded-[9px] border border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Card
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Visa ending in 4242</span>
              <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
              <span>Expires 06/28</span>
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" className="w-fit">
            Update
          </Button>
        </div>

        {/* Invoice List */}
        <div className="flex flex-col">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-b-0 dark:border-gray-800"
            >
              <div className="flex flex-col gap-0.5 text-start">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {invoice.id}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span>{invoice.amount}</span>
                  <span className="size-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                  <span>{invoice.date}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 rounded-[10px] px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                View Invoice
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
