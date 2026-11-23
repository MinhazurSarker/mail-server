"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ArchiveIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  SearchIcon,
  TrashBinIcon,
  VerticalDotsIcon,
} from "@/icons";
import { cn } from "@/utils";
import type { MailHeaderProps } from "./types";

export default function MailHeader({
  allChecked,
  onSelectAll,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  onDeleteSelected,
  onMarkAsRead,
}: MailHeaderProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectBoxRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <div
          ref={selectBoxRef}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900"
        >
          <Checkbox
            checked={allChecked}
            onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
            aria-label="Select all messages"
          />
          <DropdownMenu open={isSelectOpen} onOpenChange={setIsSelectOpen}>
            <DropdownMenuTrigger
              aria-label="Select options"
              className="flex cursor-pointer items-center justify-center text-gray-500 outline-none transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronDownIcon
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  isSelectOpen && "rotate-180"
                )}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              anchor={selectBoxRef}
              align="start"
              side="bottom"
              sideOffset={8}
              className="w-36 min-w-36 p-1.5"
            >
              <DropdownMenuItem
                onClick={() => {
                  if (onSelectFilter) {
                    onSelectFilter("all");
                  } else {
                    onSelectAll(true);
                  }
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSelectFilter?.("read")}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Read
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSelectFilter?.("unread")}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Unread
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          size="icon-sm"
          variant="outline"
          onClick={onMarkAsRead}
          aria-label="Mark as read"
        >
          <EnvelopeIcon className="size-5.5" />
        </Button>

        <Button
          size="icon-sm"
          variant="outline"
          onClick={onDeleteSelected}
          aria-label="Delete selected"
          className=""
        >
          <TrashBinIcon />
        </Button>

        <Button size="icon-sm" variant="outline" aria-label="Archive selected">
          <ArchiveIcon className="" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="More actions"
              />
            }
          >
            <VerticalDotsIcon className="" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 p-1.5">
            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
              Mark all as read
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
              Filter unread
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
              Mute selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <InputGroup className="h-10 w-full sm:w-64">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-4 text-gray-400" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
    </div>
  );
}
