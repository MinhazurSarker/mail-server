"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from "@/icons";
import { cn } from "@/utils";
import { workspaces } from "../data";
import type { SidebarHeaderProps, Workspace } from "./types";

export default function SidebarHeader({
  selectedWorkspace,
  onSelectWorkspace,
  className,
}: SidebarHeaderProps) {
  return (
    <div className={cn("p-3 pb-0", className)}>
      {/* Workspace Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 text-start outline-hidden transition hover:bg-gray-100/80 dark:border-gray-800 dark:bg-white/3 dark:hover:bg-white/5"
          aria-label="Switch workspace"
        >
          <WorkspaceLabel workspace={selectedWorkspace} />
          <ChevronUpDownIcon className="size-5 shrink-0 text-gray-500 **:stroke-[1.3px] dark:text-gray-400" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-58 min-w-56.5 p-1.5"
        >
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <WorkspaceLabel workspace={workspace} />
              {selectedWorkspace.id === workspace.id && (
                <CheckIcon className="size-5 text-gray-700 **:stroke-[1.3px] dark:text-gray-400" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <DropdownMenuItem className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
            <PlusIcon className="size-5 **:stroke-[1.3px]" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function WorkspaceLabel({ workspace }: { workspace: Workspace }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-9 shrink-0">
        {workspace.image && (
          <AvatarImage src={workspace.image} alt={workspace.name} />
        )}
        <AvatarFallback
          className={cn("text-sm font-medium text-white", workspace.colorClass)}
        >
          {workspace.initial}
        </AvatarFallback>
      </Avatar>
      <div className="text-start">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {workspace.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {workspace.plan}
        </p>
      </div>
    </div>
  );
}
