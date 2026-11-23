"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";
import CardHeader from "./card-header";
import { defaultFolders } from "./data";
import FolderCard from "./folder-card";
import { AllFoldersProps, FolderItem } from "./types";

export default function AllFolders({
  className,
  initialData = defaultFolders,
  onViewAll,
  onViewMore,
  onDeleteFolder,
}: AllFoldersProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col justify-between gap-0 rounded-2xl border border-gray-200 bg-white p-0 sm:p-0 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <CardHeader onViewAll={onViewAll} />

      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 sm:grid-rows-2 sm:gap-6">
          {initialData.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onViewMore={onViewMore}
              onDelete={onDeleteFolder}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
