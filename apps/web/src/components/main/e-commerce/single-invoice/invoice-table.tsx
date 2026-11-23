import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils";
import { defaultInvoiceData } from "./data";
import { InvoiceTableProps } from "./types";

export default function InvoiceTable({
  items = defaultInvoiceData.items,
  className,
}: InvoiceTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-transparent",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-start text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              S.No.
            </TableCell>
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              Products
            </TableCell>
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Quantity
            </TableCell>
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Unit Cost
            </TableCell>
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Discount
            </TableCell>
            <TableCell
              isHeader
              className="h-11 px-5 py-2 text-end text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Total
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              className={cn(
                "border-gray-100 dark:border-gray-800",
                index < items.length - 1 && "border-b",
              )}
            >
              <TableCell className="h-13.5 px-5 py-3 text-start text-sm font-normal text-gray-500 dark:text-gray-400">
                {item.id}
              </TableCell>
              <TableCell className="h-13.5 px-5 py-3 text-start text-sm font-medium text-gray-800 dark:text-white/90">
                {item.product}
              </TableCell>
              <TableCell className="h-13.5 px-5 py-3 text-center text-sm font-normal text-gray-500 dark:text-gray-400">
                {item.quantity}
              </TableCell>
              <TableCell className="h-13.5 px-5 py-3 text-center text-sm font-normal text-gray-500 dark:text-gray-400">
                ${item.unitCost.toLocaleString()}
              </TableCell>
              <TableCell className="h-13.5 px-5 py-3 text-center text-sm font-normal text-gray-500 dark:text-gray-400">
                {item.discount}%
              </TableCell>
              <TableCell className="h-13.5 px-5 py-3 text-end text-sm font-normal text-gray-500 dark:text-gray-400">
                ${item.total.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
