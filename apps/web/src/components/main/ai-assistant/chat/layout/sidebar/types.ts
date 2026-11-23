export interface ChatItem {
  id: string;
  title: string;
}

export interface SidebarHeaderProps {
  onNewChat?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCloseMobile?: () => void;
}

export interface ChatItemDropdownProps {
  chatId: string;
  title: string;
  isActive: boolean;
  isStarred?: boolean;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
}

export interface SidebarChatItemProps {
  chat: ChatItem;
  isActive: boolean;
  isStarred?: boolean;
  onSelect?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  roundedVariant?: "full" | "lg";
}

export interface StarredSectionProps {
  items: ChatItem[];
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
}

export interface RecentSectionProps {
  initialItems: ChatItem[];
  extraItems: ChatItem[];
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
}

export interface SidebarBodyProps {
  onNewChat?: () => void;
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  onCloseMobile?: () => void;
}

export interface AiSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onNewChat?: () => void;
  activeChatId?: string;
  onSelectChat?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  className?: string;
}
