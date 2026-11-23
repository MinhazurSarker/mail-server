"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { DownloadIcon, EyeIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { InvoiceRowProps } from "./types";

export default function InvoiceRow({
  invoice,
  onDownload,
  onView,
  className,
}: InvoiceRowProps) {
  return (
    <TableRow
      className={cn(
        "h-16 border-b border-gray-100 dark:border-gray-800",
        className,
      )}
    >
      <TableCell className="min-w-64 py-3 ps-5 sm:ps-6">
        <div className="flex items-center gap-3">
          <div className="relative size-7 shrink-0 overflow-hidden">
            <Image
              src="/images/task/pdf.svg"
              alt="PDF Icon"
              width={28}
              height={28}
              className="size-full object-contain"
            />
          </div>
          <span className="text-sm font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
            {invoice.name}
          </span>
        </div>
      </TableCell>

      <TableCell className="min-w-36 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {invoice.date}
      </TableCell>

      <TableCell className="min-w-32 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {invoice.price}
      </TableCell>

      <TableCell className="min-w-36 px-4 py-3 text-start text-sm font-normal whitespace-nowrap text-gray-700 dark:text-gray-400">
        {invoice.plan}
      </TableCell>

      <TableCell className="min-w-28 px-4 py-3 text-start whitespace-nowrap">
        <Badge
          variant="light"
          color={invoice.status === "Paid" ? "success" : "error"}
          size="sm"
        >
          {invoice.status}
        </Badge>
      </TableCell>

      <TableCell className="min-w-28 py-3 pe-5 text-end whitespace-nowrap sm:pe-6">
        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Download ${invoice.name}`}
            onClick={() => onDownload?.(invoice)}
            className="size-9 rounded-lg border-gray-300 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
          >
            <DownloadIcon className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`View ${invoice.name}`}
            onClick={() => onView?.(invoice)}
            className="size-9 rounded-lg border-gray-300 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
          >
            <EyeIcon className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
