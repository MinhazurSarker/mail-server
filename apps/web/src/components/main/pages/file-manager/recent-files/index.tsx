"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/utils";
import * as React from "react";
import CardHeader from "./card-header";
import { defaultRecentFiles } from "./data";
import FileRow from "./file-row";
import TableHeader from "./table-header";
import { RecentFileItem, RecentFilesProps } from "./types";

export default function RecentFiles({
  className,
  initialData = defaultRecentFiles,
  onViewAll,
  onViewFile,
  onDeleteFile,
}: RecentFilesProps) {
  const [files, setFiles] = React.useState<RecentFileItem[]>(initialData);

  const handleDelete = (file: RecentFileItem) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    onDeleteFile?.(file);
  };

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader onViewAll={onViewAll} />

      <CardContent className="p-0">
        <ScrollArea scrollbars="horizontal" className="w-full">
          <Table className="min-w-162.5">
            <TableHeader />
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onView={onViewFile}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export { default as CardHeader } from "./card-header";
export * from "./data";
export { default as FileRow } from "./file-row";
export { default as TableHeader } from "./table-header";
export * from "./types";
