"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "@/icons";
import { cn } from "@/utils";
import { defaultInvoiceMetrics } from "./data";
import MetricItem from "./metric-item";
import { InvoiceOverviewProps } from "./types";

export default function InvoiceOverview({
  title = "Overview",
  createButtonText = "Create an Invoice",
  onCreateInvoice,
  metrics = defaultInvoiceMetrics,
  className,
}: InvoiceOverviewProps) {
  return (
    <Card
      className={cn(
        "gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-0">
        <CardTitle className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {title}
        </CardTitle>
        <Button onClick={onCreateInvoice}>
          <PlusIcon className="size-5" />
          <span>{createButtonText}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 rounded-xl border border-gray-200 bg-white sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800 dark:bg-white/2">
          {metrics.map((item, index) => (
            <MetricItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export { InvoiceOverview };
