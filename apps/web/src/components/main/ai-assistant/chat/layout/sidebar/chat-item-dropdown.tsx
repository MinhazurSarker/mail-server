"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  HorizontalDotsIcon,
  PencilIcon,
  StarIcon,
  TrashBinIcon,
} from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";
import RenameChatDialog from "../header/rename-chat-dialog";
import { ChatItemDropdownProps } from "./types";

export default function ChatItemDropdown({
  chatId,
  title,
  isActive,
  isStarred = false,
  onRename,
  onDelete,
  onToggleStar,
}: ChatItemDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={cn(
                "flex size-6.5 shrink-0 items-center justify-center rounded-full transition-all focus:outline-none",
                isActive
                  ? "bg-gray-200/90 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  : "text-gray-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200",
                dropdownOpen && "opacity-100",
              )}
              aria-label="Chat options"
            >
              <HorizontalDotsIcon className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuItem
            onClick={() => onToggleStar?.(chatId)}
            className="gap-2.5"
          >
            <StarIcon
              className={cn(
                "size-4.5",
                isStarred
                  ? "fill-amber-500 text-amber-500!"
                  : "text-gray-500 dark:text-gray-400",
              )}
            />
            <span>{isStarred ? "Unstar" : "Star"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setRenameOpen(true)}
            className="gap-2.5"
          >
            <PencilIcon className="size-4.5 text-gray-500 dark:text-gray-400" />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete?.(chatId)}
            className="gap-2.5"
          >
            <TrashBinIcon className="size-4.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentTitle={title}
        onSave={(newTitle) => onRename?.(chatId, newTitle)}
      />
    </>
  );
}
