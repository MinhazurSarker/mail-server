import type { IconProps } from "@/icons";
import type { ComponentType } from "react";

export interface MailAttachment {
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface MailItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  content: string;
  time: string;
  date: string;
  badge?: "Important" | "Social" | "Promotional";
  isRead: boolean;
  isStarred: boolean;
  attachments?: MailAttachment[];
}

export interface MailboxCategory {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
  path: string;
  count?: number;
  iconClassName?: string;
}

export interface FilterCategory {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
  count?: number;
  iconClassName?: string;
  path?: string;
}

export interface LabelCategory {
  id: string;
  label: string;
  colorClass: string;
  count?: number;
}
