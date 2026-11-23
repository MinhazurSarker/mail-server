import {
  CalendarIcon,
  GearIcon,
  LayoutGridIcon,
  MailIcon,
  PageIcon,
  TableIcon,
  UserCircleIcon,
  UsersIcon,
} from "@/icons";
import { NavItem } from "./types";

export const navItems: NavItem[] = [
  {
    icon: <MailIcon className="size-6 stroke-[1.5px]" />,
    key: "mailbox",
    name: "Mailbox",
    path: "/inbox",
  },
  {
    icon: <UserCircleIcon className="size-6 stroke-[1.5px]" />,
    key: "contacts",
    name: "Contacts",
    path: "/contacts",
  },
  {
    icon: <CalendarIcon className="size-6 stroke-[1.5px]" />,
    key: "calendar",
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <GearIcon className="size-6 stroke-[1.5px]" />,
    key: "settings",
    name: "Settings",
    path: "/settings",
  },
];

export const supportItems: NavItem[] = [
  {
    icon: <TableIcon className="size-6 stroke-[1.5px]" />,
    key: "tenantAdmin",
    name: "Tenant Admin",
    path: "/org/cellsweb/admin",
  },
  {
    icon: <LayoutGridIcon className="size-6 stroke-[1.5px]" />,
    key: "platformAdmin",
    name: "Platform Governance",
    path: "/admin",
  },
];

export const othersItems: NavItem[] = [];
