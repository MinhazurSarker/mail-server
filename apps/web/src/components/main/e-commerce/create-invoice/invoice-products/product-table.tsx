"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrashBinIcon } from "@/icons";
import { InvoiceItem } from "../types";
import { formatCurrency } from "./utils";

interface ProductTableProps {
  items: InvoiceItem[];
  onRemoveItem: (id: string) => void;
}

export default function ProductTable({ items, onRemoveItem }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-transparent">
      <ScrollArea scrollbars="horizontal" className="w-full">
        <Table className="w-full text-start">
          <TableHeader className="border-b border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <TableRow>
              <TableCell
                isHeader
                className="w-16 min-w-16 px-5 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                S.No.
              </TableCell>
              <TableCell
                isHeader
                className="min-w-44 px-5 py-3 text-start text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="min-w-28 px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                Quantity
              </TableCell>
              <TableCell
                isHeader
                className="min-w-28 px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                Unit Cost
              </TableCell>
              <TableCell
                isHeader
                className="min-w-28 px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                Discount
              </TableCell>
              <TableCell
                isHeader
                className="min-w-28 px-5 py-3 text-center text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-300"
              >
                Total
              </TableCell>
              <TableCell
                isHeader
                className="w-14 min-w-14 px-5 py-3 text-center"
              >
                <span className="sr-only">Actions</span>
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell className="px-5 py-4 text-start text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {index + 1}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-sm font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
                  {item.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {item.quantity}
                </TableCell>
                <TableCell className="px-5 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.unitCost)}
                </TableCell>
                <TableCell className="px-5 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {item.discount}%
                </TableCell>
                <TableCell className="px-5 py-4 text-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatCurrency(item.total)}
                </TableCell>
                <TableCell className="px-5 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="cursor-pointer text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                    aria-label={`Remove ${item.name}`}
                  >
                    <TrashBinIcon className="size-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No items added yet. Fill in the form below to add products.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
