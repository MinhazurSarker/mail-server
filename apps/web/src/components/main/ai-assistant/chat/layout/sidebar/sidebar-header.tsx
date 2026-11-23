"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SidebarHeader as HeaderContainer } from "@/components/ui/sidebar";
import { PlusIcon, SearchIcon, XIcon } from "@/icons";
import { SidebarHeaderProps } from "./types";

export default function SidebarHeader({
  onNewChat,
  searchQuery,
  onSearchChange,
  onCloseMobile,
}: SidebarHeaderProps) {
  return (
    <HeaderContainer className="flex w-full min-w-0 flex-col gap-4 p-5 pb-3">
      {/* Mobile Title & Close */}
      <div className="flex items-center justify-between xl:hidden">
        <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
          Chat History
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="cursor-pointer rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Close sidebar"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <Button
        type="button"
        onClick={onNewChat}
        className="h-10 w-full gap-2 rounded-[10px] bg-brand-500 font-medium text-white shadow-theme-xs hover:bg-brand-600"
      >
        <PlusIcon className="size-5" />
        <span>New Chat</span>
      </Button>

      {/* Search Input */}
      <InputGroup className="h-10 w-full rounded-[10px]">
        <InputGroupAddon align="inline-start">
          <SearchIcon className="size-4.5 text-gray-400" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm"
        />
      </InputGroup>
    </HeaderContainer>
  );
}
