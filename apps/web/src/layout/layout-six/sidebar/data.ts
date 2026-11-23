import {
  BarChartIcon,
  BoltTwoIcon,
  BoxIcon,
  CalendarIcon,
  CallIcon,
  EnvelopeIcon,
  GearTwoIcon,
  InboxIcon,
  LayoutGridIcon,
  PluginIcon,
  UserCircleIcon,
} from "@/icons";
import type { NavItemType } from "./types";

export const navItems: NavItemType[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGridIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "profiles", label: "Profiles", icon: UserCircleIcon },
  { id: "settings", label: "Settings", icon: GearTwoIcon },
  { id: "design", label: "Design Engineering", icon: BoltTwoIcon },
  { id: "email", label: "Email", icon: EnvelopeIcon },
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "support", label: "Customer Support", icon: CallIcon },
  { id: "analytics", label: "Analytics", icon: BarChartIcon },
  { id: "integrations", label: "Integrations", icon: PluginIcon },
  { id: "components", label: "Components", icon: BoxIcon },
];
