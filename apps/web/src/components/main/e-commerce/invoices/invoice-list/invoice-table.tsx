"use client";

import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/utils";
import InvoiceEmptyState from "./empty-state";
import InvoiceRow from "./invoice-row";
import InvoiceTableHeader from "./table-header";
import { InvoiceTableContentProps } from "./types";

export default function InvoiceTable({
  invoices,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelectRow,
  sortField,
  sortDirection,
  onSort,
  hasFiltersActive,
  onClearFilters,
  onViewInvoice,
  onDownloadInvoice,
  onDeleteInvoice,
  className,
}: InvoiceTableContentProps) {
  return (
    <CardContent className={cn("p-0", className)}>
      <ScrollArea scrollbars="horizontal" className="w-full">
        <Table>
          <InvoiceTableHeader
            isAllSelected={isAllSelected}
            onToggleSelectAll={onToggleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  isSelected={selectedIds.has(invoice.id)}
                  onToggleSelect={(checked) =>
                    onToggleSelectRow(invoice.id, checked)
                  }
                  onView={onViewInvoice}
                  onDownload={onDownloadInvoice}
                  onDelete={onDeleteInvoice}
                />
              ))
            ) : (
              <InvoiceEmptyState
                hasFiltersActive={hasFiltersActive}
                onClearFilters={onClearFilters}
              />
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </CardContent>
  );
}
