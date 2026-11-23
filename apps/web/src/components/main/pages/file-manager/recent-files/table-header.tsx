import { TableCell, TableHeader as Head, TableRow } from "@/components/ui/table";

export default function TableHeader() {
  return (
    <Head className="border-b border-gray-100 dark:border-gray-800">
      <TableRow>
        <TableCell
          isHeader
          className="h-11 min-w-44 py-3 ps-4 text-start text-xs font-medium text-gray-500 sm:ps-6 dark:text-gray-400"
        >
          File Name
        </TableCell>
        <TableCell
          isHeader
          className="h-11 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Category
        </TableCell>
        <TableCell
          isHeader
          className="h-11 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Size
        </TableCell>
        <TableCell
          isHeader
          className="h-11 px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Date Modified
        </TableCell>
        <TableCell
          isHeader
          className="h-11 py-3 pe-4 text-center text-xs font-medium text-gray-500 sm:pe-6 dark:text-gray-400"
        >
          Action
        </TableCell>
      </TableRow>
    </Head>
  );
}
