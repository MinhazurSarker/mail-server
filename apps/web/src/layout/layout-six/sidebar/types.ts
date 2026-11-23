import type { ComponentType, SVGProps } from "react";

export type SidebarSixIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItemType {
  id: string;
  label: string;
  icon: SidebarSixIcon;
  href?: string;
}
