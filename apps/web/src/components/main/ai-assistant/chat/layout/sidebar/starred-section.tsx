"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import SidebarChatItem from "./sidebar-chat-item";
import { StarredSectionProps } from "./types";

export default function StarredSection({
  items,
  activeChatId,
  onSelectChat,
  onRename,
  onDelete,
  onToggleStar,
}: StarredSectionProps) {
  if (items.length === 0) return null;

  return (
    <SidebarGroup className="w-full min-w-0 p-0">
      <SidebarGroupLabel className="mb-2 h-6 px-3 text-xs font-normal text-gray-400 dark:text-gray-500">
        Starred
      </SidebarGroupLabel>
      <SidebarGroupContent className="w-full min-w-0">
        <SidebarMenu className="w-full min-w-0 gap-0.5">
          {items.map((chat) => (
            <SidebarChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              isStarred={true}
              onSelect={onSelectChat}
              onRename={onRename}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
              roundedVariant="full"
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
