import type { ComponentType } from "react";

export interface TokenStatItem {
  id: string;
  name: string;
  keyCount: number;
  usage: string;
  dotColor: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
}
