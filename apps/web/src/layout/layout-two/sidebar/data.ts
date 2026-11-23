import {
  BarChartIcon,
  BellIcon,
  BoltTwoIcon,
  BoxIcon,
  CallIcon,
  GearTwoIcon,
  LayoutGridIcon,
  PieChartIcon,
  UserIcon,
} from "@/icons";
import type { SidebarTwoNavGroup } from "./types";

export const sidebarTwoNavGroups: SidebarTwoNavGroup[] = [
  {
    group: "General",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: LayoutGridIcon,
        items: [
          {
            key: "inventoryManagement",
            label: "Inventory Management",
            path: "#",
          },
          {
            key: "productDevelopment",
            label: "Product Development",
            path: "#",
          },
          { key: "finance", label: "Finance", path: "#" },
          { key: "humanResources", label: "Human Resources", path: "#" },
          { key: "supplyChain", label: "Supply Chain", path: "#" },
        ],
      },
      {
        key: "profile",
        label: "Public Profiles",
        icon: UserIcon,
        path: "#",
      },
      {
        key: "settings",
        label: "Settings",
        icon: GearTwoIcon,
        path: "#",
      },
      {
        key: "notifications",
        label: "Notifications",
        icon: BellIcon,
        path: "#",
      },
      {
        key: "analytics",
        label: "User Analytics",
        icon: BarChartIcon,
        path: "#",
      },
    ],
  },
  {
    group: "Projects",
    items: [
      {
        key: "designEngineering",
        label: "Design Engineering",
        icon: BoltTwoIcon,
        path: "#",
      },
      {
        key: "marketing",
        label: "Sales & Marketing",
        icon: PieChartIcon,
        path: "#",
      },
      {
        key: "saas",
        label: "SaaS",
        icon: BoxIcon,
        path: "#",
      },
      {
        key: "customerSupport",
        label: "Customer Support",
        icon: CallIcon,
        path: "#",
      },
    ],
  },
  {
    group: "API Reference",
    items: [
      {
        key: "fileConventions",
        label: "File Conventions",
        path: "#",
      },
      {
        key: "versionControl",
        label: "Version Control",
        path: "#",
      },
      {
        key: "fileOrganization",
        label: "File Organization",
        path: "#",
      },
      {
        key: "backupProcedures",
        label: "Backup Procedures",
        path: "#",
      },
    ],
  },
];
