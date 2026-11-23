import type { ComponentType, SVGProps } from "react";

export type SidebarTwoIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface SidebarTwoMenuItem {
  key: string;
  label: string;
  icon?: SidebarTwoIcon;
  path?: string;
  badge?: string;
  items?: SidebarTwoMenuItem[];
}

export interface SidebarTwoNavGroup {
  group: string;
  items: SidebarTwoMenuItem[];
}
