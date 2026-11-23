import type { ComponentType, SVGProps } from "react";

export type TabId =
  | "account"
  | "general"
  | "billing"
  | "personalization"
  | "memory"
  | "file-media"
  | "model"
  | "connector"
  | "data-control";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItem {
  id: TabId;
  label: string;
  icon: IconComponent;
  path: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface Workspace {
  id: number;
  name: string;
  plan: string;
  initial: string;
  colorClass: string;
  image?: string;
}

export interface SidebarHeaderProps {
  selectedWorkspace: Workspace;
  onSelectWorkspace: (workspace: Workspace) => void;
  onCloseMobile?: () => void;
  className?: string;
}

export interface SidebarBodyProps {
  onCloseMobile?: () => void;
  className?: string;
}

export interface SettingsSidebarProps {
  className?: string;
}
