import { TableCell, TableHeader as Head, TableRow } from "@/components/ui/table";

export default function TableHeader() {
  return (
    <Head className="border-b border-gray-100 dark:border-gray-800">
      <TableRow>
        <TableCell
          isHeader
          className="h-11 min-w-[380px] py-3 ps-4 text-start text-xs font-medium text-gray-500 sm:ps-6 dark:text-gray-400"
        >
          Name & Key
        </TableCell>
        <TableCell
          isHeader
          className="h-11 min-w-[120px] px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Status
        </TableCell>
        <TableCell
          isHeader
          className="h-11 min-w-[130px] px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Created
        </TableCell>
        <TableCell
          isHeader
          className="h-11 min-w-[140px] px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Last used
        </TableCell>
        <TableCell
          isHeader
          className="h-11 min-w-[120px] px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          Disable/Enable
        </TableCell>
        <TableCell
          isHeader
          className="h-11 min-w-[100px] py-3 pe-4 text-center text-xs font-medium text-gray-500 sm:pe-6 dark:text-gray-400"
        >
          Action
        </TableCell>
      </TableRow>
    </Head>
  );
}
