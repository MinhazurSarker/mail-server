"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { TransactionHeaderProps } from "./types";

export default function TransactionHeader({
  orderId = "#34834",
  status = "Completed",
  dueDate = "25 August 2025",
  className,
  onViewReceipt,
  onRefund,
}: TransactionHeaderProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-700 dark:text-gray-300">
            Order ID : {orderId}
          </span>
          <Badge color="success" variant="light" size="sm">
            {status}
          </Badge>
        </div>

        <Separator
          orientation="vertical"
          className="hidden h-4 bg-gray-300 sm:block dark:bg-gray-700"
        />

        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          Due date: {dueDate}
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          variant="default"
          onClick={onViewReceipt}
          className="flex-1 sm:flex-initial px-5 py-3 h-11 rounded-[10px] text-sm font-medium shadow-theme-xs"
        >
          View Receipt
        </Button>
        <Button
          variant="outline"
          onClick={onRefund}
          className="flex-1 sm:flex-initial px-5 py-3 h-11 rounded-[10px] text-sm font-medium shadow-theme-xs"
        >
          Refund
        </Button>
      </div>
    </Card>
  );
}
