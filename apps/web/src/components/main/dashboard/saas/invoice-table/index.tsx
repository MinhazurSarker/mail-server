"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { invoiceTableData } from "./data";
import InvoiceRow from "./invoice-row";

export default function SaasInvoiceTable() {
  const t = useTranslations("saas.recentInvoices");

  return (
    <Card className="w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </CardTitle>
      </CardHeader>

      <ScrollArea className="max-w-full">
        <Table>
          <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <TableRow>
              <TableCell
                isHeader
                className="px-6 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {t("table.serialNo")}
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {t("table.closeDate")}
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {t("table.user")}
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {t("table.amount")}
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
              >
                {t("table.status")}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoiceTableData.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
