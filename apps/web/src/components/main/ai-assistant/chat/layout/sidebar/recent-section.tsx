"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";
import SidebarChatItem from "./sidebar-chat-item";
import { RecentSectionProps } from "./types";

export default function RecentSection({
  initialItems,
  extraItems,
  activeChatId,
  onSelectChat,
  onRename,
  onDelete,
  onToggleStar,
}: RecentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (initialItems.length === 0 && extraItems.length === 0) return null;

  return (
    <SidebarGroup className="w-full min-w-0 p-0">
      <SidebarGroupLabel className="mb-2 h-6 px-3 text-xs font-normal text-gray-400 dark:text-gray-500">
        Recent
      </SidebarGroupLabel>
      <SidebarGroupContent className="w-full min-w-0">
        <SidebarMenu className="w-full min-w-0 gap-0.5">
          {initialItems.map((chat) => (
            <SidebarChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              isStarred={false}
              onSelect={onSelectChat}
              onRename={onRename}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
              roundedVariant="full"
            />
          ))}
        </SidebarMenu>

        {extraItems.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="w-full min-w-0">
              <SidebarMenu className="w-full min-w-0 gap-0.5 pt-0.5">
                {extraItems.map((chat) => (
                  <SidebarChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    isStarred={false}
                    onSelect={onSelectChat}
                    onRename={onRename}
                    onDelete={onDelete}
                    onToggleStar={onToggleStar}
                    roundedVariant="full"
                  />
                ))}
              </SidebarMenu>
            </CollapsibleContent>

            <div className="relative pt-2">
              {!isExpanded && (
                <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-b from-transparent to-white dark:to-gray-900" />
              )}
              <CollapsibleTrigger
                render={
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span>{isExpanded ? "Show less" : "Show more..."}</span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>
                }
              />
            </div>
          </Collapsible>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
