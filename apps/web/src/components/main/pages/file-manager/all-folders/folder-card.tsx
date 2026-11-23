"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { VerticalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { GradientFolderIcon } from "./icons";
import { FolderCardProps } from "./types";

export default function FolderCard({
  folder,
  className,
  onViewMore,
  onDelete,
}: FolderCardProps) {
  const { title, fileCount, size } = folder;

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6 dark:border-gray-800 dark:bg-white/3",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <GradientFolderIcon />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More folder options"
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <VerticalDotsIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 dark:bg-[#171F2E]">
            <DropdownMenuItem
              onClick={() => onViewMore?.(folder)}
              className="cursor-pointer text-start text-xs font-normal"
            >
              View More
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(folder)}
              variant="destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>

        <div className="flex items-center justify-between">
          <span className="block text-sm text-gray-500 dark:text-gray-400">
            {fileCount}{" "}
            {typeof fileCount === "number" ||
            !fileCount.toString().toLowerCase().includes("file")
              ? "Files"
              : ""}
          </span>
          <span className="block text-end text-sm text-gray-500 dark:text-gray-400">
            {size}
          </span>
        </div>
      </div>
    </div>
  );
}
