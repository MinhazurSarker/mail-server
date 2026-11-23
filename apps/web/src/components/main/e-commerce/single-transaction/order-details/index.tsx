import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";
import { initialOrderItems, initialOrderSummary } from "./data";
import OrderSummary from "./order-summary";
import OrderTable from "./order-table";
import { OrderDetailsProps } from "./types";

export default function OrderDetails({
  items = initialOrderItems,
  summary = initialOrderSummary,
  title = "Order Details",
  className,
}: OrderDetailsProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <CardTitle className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </CardTitle>
        <OrderTable items={items} />
      </div>
      <OrderSummary summary={summary} />
    </Card>
  );
}
