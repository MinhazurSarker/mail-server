import type { ComponentType, SVGProps } from "react";

export type SidebarOneIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface SidebarOneMenuItem {
  key: string;
  label: string;
  icon?: SidebarOneIcon;
  path?: string;
  badge?: string;
  items?: SidebarOneMenuItem[];
}
