"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader as TableHead,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { useMemo, useState } from "react";
import { initialInvoicesData } from "./data";
import InvoiceRow from "./invoice-row";
import TableFooter from "./table-footer";
import TableHeader from "./table-header";
import { Invoice, InvoiceTableProps } from "./types";

export default function InvoiceTable({
  initialData = initialInvoicesData,
  itemsPerPage = 5,
  className,
  onDownloadAll,
  onDownloadInvoice,
  onViewInvoice,
}: InvoiceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(10, Math.ceil(initialData.length / itemsPerPage));
  }, [initialData.length, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = initialData.slice(startIndex, startIndex + itemsPerPage);
    // If navigating to higher pages than sample data contains, recycle sample data with offset IDs
    if (pageItems.length === 0 && initialData.length > 0) {
      return initialData.slice(0, itemsPerPage).map((item, idx) => ({
        ...item,
        id: startIndex + idx + 1,
      }));
    }
    return pageItems;
  }, [initialData, currentPage, itemsPerPage]);

  const handleDownloadAll = () => {
    if (onDownloadAll) {
      onDownloadAll();
    } else {
      console.log("Downloading all invoices...");
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (onDownloadInvoice) {
      onDownloadInvoice(invoice);
    } else {
      console.log(`Downloading ${invoice.name}...`);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(invoice);
    } else {
      console.log(`Viewing ${invoice.name}...`);
    }
  };

  return (
    <Card
      className={cn(
        "w-full max-w-full min-w-0 gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      {/* Card Header with Title, Description and Download All */}
      <TableHeader onDownloadAll={handleDownloadAll} />

      {/* Table Content with horizontal ScrollArea */}
      <CardContent className="p-0">
        <ScrollArea scrollbars="horizontal" className="w-full">
          <Table>
            <TableHead className="border-y border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableCell
                  isHeader
                  className="h-11 min-w-64 py-3 ps-5 text-start text-sm font-normal text-gray-500 sm:ps-6 dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-36 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-32 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-36 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  Plan
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-28 px-4 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="h-11 min-w-28 py-3 pe-5 text-end text-sm font-normal text-gray-500 sm:pe-6 dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedData.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onDownload={handleDownloadInvoice}
                  onView={handleViewInvoice}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Table Footer - Responsive Pagination */}
      <TableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Card>
  );
}

export { default as CardFooter } from "./card-footer";
export { default as CardHeader } from "./card-header";
export * from "./data";
export { default as InvoiceRow } from "./invoice-row";
export { default as TableFooter } from "./table-footer";
export { default as TableHeader } from "./table-header";
export * from "./types";
