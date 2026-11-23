import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { EyeIcon, TrashBinIcon } from "@/icons";
import type { FileRowProps } from "./types";

export default function FileRow({ file, onView, onDelete }: FileRowProps) {
  const { fileName, fileIcon: FileIcon, category, size, dateModified } = file;

  return (
    <TableRow className="">
      <TableCell className="py-3 ps-4 sm:ps-6">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-white/90">
          <span className="shrink-0">
            <FileIcon aria-label={category} />
          </span>
          <span>{fileName}</span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3 text-start text-sm text-gray-700 dark:text-gray-400">
        {category}
      </TableCell>

      <TableCell className="px-4 py-3 text-start text-sm text-gray-700 dark:text-gray-400">
        {size}
      </TableCell>

      <TableCell className="px-4 py-3 text-start text-sm text-gray-700 dark:text-gray-400">
        {dateModified}
      </TableCell>

      <TableCell className="py-3 pe-4 text-center sm:pe-6">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onDelete?.(file)}
            className="hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-500"
            aria-label={`Delete ${fileName}`}
          >
            <TrashBinIcon />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onView?.(file)}
            aria-label={`View ${fileName}`}
          >
            <EyeIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
