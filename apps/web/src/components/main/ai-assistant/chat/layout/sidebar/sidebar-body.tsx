"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarContent } from "@/components/ui/sidebar";
import { useState } from "react";
import {
  RECENT_CHATS_EXTRA,
  RECENT_CHATS_INITIAL,
  STARRED_CHATS,
} from "./data";
import RecentSection from "./recent-section";
import SidebarHeader from "./sidebar-header";
import StarredSection from "./starred-section";
import { ChatItem, SidebarBodyProps } from "./types";

export default function SidebarBody({
  onNewChat,
  activeChatId = "s2",
  onSelectChat,
  onRename: onRenameProp,
  onDelete: onDeleteProp,
  onToggleStar: onToggleStarProp,
  onCloseMobile,
}: SidebarBodyProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [starredChats, setStarredChats] = useState<ChatItem[]>(STARRED_CHATS);
  const [recentInitial, setRecentInitial] =
    useState<ChatItem[]>(RECENT_CHATS_INITIAL);
  const [recentExtra, setRecentExtra] = useState<ChatItem[]>(RECENT_CHATS_EXTRA);

  const handleRename = (id: string, newTitle: string) => {
    setStarredChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
    setRecentInitial((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
    setRecentExtra((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
    onRenameProp?.(id, newTitle);
  };

  const handleDelete = (id: string) => {
    setStarredChats((prev) => prev.filter((c) => c.id !== id));
    setRecentInitial((prev) => prev.filter((c) => c.id !== id));
    setRecentExtra((prev) => prev.filter((c) => c.id !== id));
    onDeleteProp?.(id);
  };

  const handleToggleStar = (id: string) => {
    const isCurrentlyStarred = starredChats.some((c) => c.id === id);
    if (isCurrentlyStarred) {
      const chat = starredChats.find((c) => c.id === id);
      if (chat) {
        setStarredChats((prev) => prev.filter((c) => c.id !== id));
        setRecentInitial((prev) => [chat, ...prev]);
      }
    } else {
      const chat =
        recentInitial.find((c) => c.id === id) ||
        recentExtra.find((c) => c.id === id);
      if (chat) {
        setRecentInitial((prev) => prev.filter((c) => c.id !== id));
        setRecentExtra((prev) => prev.filter((c) => c.id !== id));
        setStarredChats((prev) => [chat, ...prev]);
      }
    }
    onToggleStarProp?.(id);
  };

  const filterChats = (items: ChatItem[]) =>
    items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const starredFiltered = filterChats(starredChats);
  const recentFiltered = filterChats(recentInitial);
  const extraFiltered = filterChats(recentExtra);

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden">
      <SidebarHeader
        onNewChat={onNewChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCloseMobile={onCloseMobile}
      />

      <SidebarContent className="flex-1 w-full min-w-0 max-w-full overflow-hidden p-0">
        <ScrollArea scrollbars="vertical" className="h-full w-full min-w-0 max-w-full">
          <div className="flex w-full min-w-0 max-w-full flex-col gap-5 px-5 pb-4 pt-1">
            <StarredSection
              items={starredFiltered}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onRename={handleRename}
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
            />
            <RecentSection
              initialItems={recentFiltered}
              extraItems={extraFiltered}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onRename={handleRename}
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
            />
          </div>
        </ScrollArea>
      </SidebarContent>
    </div>
  );
}
