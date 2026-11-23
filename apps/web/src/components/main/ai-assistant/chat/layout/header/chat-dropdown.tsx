"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon, PencilIcon, StarIcon, TrashBinIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";
import RenameChatDialog from "./rename-chat-dialog";

interface ChatDropdownProps {
  initialTitle?: string;
  onDelete?: () => void;
}

export default function ChatDropdown({
  initialTitle = "Generate responsive login",
  onDelete,
}: ChatDropdownProps = {}) {
  const [title, setTitle] = useState(initialTitle);
  const [isStarred, setIsStarred] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      // Delete action
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="-ms-3 sm:-ms-4">
              <span className="max-w-36 truncate 2xsm:max-w-44 xsm:max-w-56 sm:max-w-[320px]">
                {title}
              </span>
              <ChevronDownIcon className="size-4 text-gray-500 transition group-data-popup-open:rotate-180 dark:text-gray-400" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-48 p-1.5">
          <DropdownMenuItem
            onClick={() => setIsStarred((prev) => !prev)}
            className="gap-2.5"
          >
            <StarIcon
              className={cn(
                "size-5",
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
            onClick={handleDelete}
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
        onSave={(newTitle) => setTitle(newTitle)}
      />
    </>
  );
}
