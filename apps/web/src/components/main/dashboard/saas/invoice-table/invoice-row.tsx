"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { Invoice } from "./types";

export interface InvoiceRowProps {
  invoice: Invoice;
}

const statusColorMap = {
  complete: "success",
  pending: "warning",
  cancelled: "error",
} as const;

export default function InvoiceRow({ invoice }: InvoiceRowProps) {
  const t = useTranslations("saas.recentInvoices");

  return (
    <TableRow className="border-b border-gray-100 transition-colors dark:border-gray-800">
      <TableCell className="px-6 py-4 text-start text-sm font-normal text-gray-700 whitespace-nowrap dark:text-gray-300">
        {invoice.id}
      </TableCell>
      <TableCell className="px-6 py-4 text-start text-sm font-normal text-gray-700 whitespace-nowrap dark:text-gray-300">
        {invoice.closeDate}
      </TableCell>
      <TableCell className="px-6 py-4 text-start text-sm font-normal text-gray-700 whitespace-nowrap dark:text-gray-300">
        {invoice.user}
      </TableCell>
      <TableCell className="px-6 py-4 text-start text-sm font-normal text-gray-700 whitespace-nowrap dark:text-gray-300">
        {invoice.amount}
      </TableCell>
      <TableCell className="px-6 py-4 text-start whitespace-nowrap">
        <Badge size="sm" color={statusColorMap[invoice.status]}>
          {t(`statuses.${invoice.status}`)}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
