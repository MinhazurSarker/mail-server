"use client";

import { SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/utils";
import ChatItemDropdown from "./chat-item-dropdown";
import { SidebarChatItemProps } from "./types";

export default function SidebarChatItem({
  chat,
  isActive,
  isStarred,
  onSelect,
  onRename,
  onDelete,
  onToggleStar,
  roundedVariant = "full",
}: SidebarChatItemProps) {
  return (
    <SidebarMenuItem className="w-full min-w-0">
      <div
        className={cn(
          "group relative flex h-9 w-full min-w-0 items-center justify-between gap-1 px-3 text-start text-sm transition-colors",
          roundedVariant === "full" ? "rounded-full" : "rounded-lg",
          isActive
            ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200",
        )}
      >
        <button
          type="button"
          onClick={() => onSelect?.(chat.id)}
          title={chat.title}
          className="flex h-full flex-1 min-w-0 max-w-full cursor-pointer items-center overflow-hidden text-start focus:outline-none"
        >
          <span className="truncate block w-full">{chat.title}</span>
        </button>

        <ChatItemDropdown
          chatId={chat.id}
          title={chat.title}
          isActive={isActive}
          isStarred={isStarred}
          onRename={onRename}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      </div>
    </SidebarMenuItem>
  );
}
