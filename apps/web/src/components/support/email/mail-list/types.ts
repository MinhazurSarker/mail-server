import type { MailItem } from "../types";

export interface MailListProps {
  emails?: MailItem[];
  onSelectMail?: (id: string) => void;
  checkedIds?: Record<string, boolean>;
  starredIds?: Record<string, boolean>;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onToggleStar?: (id: string) => void;
  onDeleteSelected?: () => void;
  onMarkAsRead?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  totalItems?: number;
}

export type MailSelectFilter = "all" | "read" | "unread";

export interface MailHeaderProps {
  allChecked: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectFilter?: (filter: MailSelectFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDeleteSelected?: () => void;
  onMarkAsRead?: () => void;
}

export interface MailItemProps {
  mail: MailItem;
  isChecked: boolean;
  isStarred: boolean;
  onToggleCheck: (checked: boolean) => void;
  onToggleStar: () => void;
  onClick?: () => void;
}

export interface MailPaginationProps {
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
}
