import type { FilterCategory, LabelCategory, MailboxCategory } from "../../types";

export interface InboxSidebarProps {
  className?: string;
  onCompose?: () => void;
  activeFolder?: string;
  onSelectFolder?: (folder: string) => void;
  activeLabel?: string | null;
  onSelectLabel?: (label: string | null) => void;
  counts?: Record<string, number>;
}

export interface SidebarHeaderProps {
  onCompose?: () => void;
}

export interface SidebarBodyProps {
  onCloseMobile?: () => void;
  activeFolder?: string;
  onSelectFolder?: (folder: string) => void;
  activeLabel?: string | null;
  onSelectLabel?: (label: string | null) => void;
  counts?: Record<string, number>;
}

export interface SidebarNavItemProps {
  item: MailboxCategory | FilterCategory;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SidebarLabelItemProps {
  item: LabelCategory;
  isActive?: boolean;
  onClick?: () => void;
}
