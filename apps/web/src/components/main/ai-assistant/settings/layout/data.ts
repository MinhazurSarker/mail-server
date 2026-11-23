import {
  BrainIcon,
  ChipIcon,
  DatabaseIcon,
  GearTwoIcon,
  HorizontalSlideIcon,
  PluginIcon,
  SparkIcon,
  TextIcon,
  UserIcon,
} from "@/icons";
import type { NavGroup, Workspace } from "./sidebar/types";

export const navGroups: NavGroup[] = [
  {
    title: "Account",
    items: [
      {
        id: "account",
        label: "Account",
        icon: UserIcon,
        path: "/ai-settings/account",
      },
      {
        id: "general",
        label: "General",
        icon: HorizontalSlideIcon,
        path: "/ai-settings/general",
      },
      {
        id: "billing",
        label: "Credit and Billing",
        icon: SparkIcon,
        path: "/ai-settings/billing",
      },
      {
        id: "personalization",
        label: "Personalization",
        icon: GearTwoIcon,
        path: "/ai-settings/personalization",
      },
    ],
  },
  {
    title: "Features",
    items: [
      {
        id: "memory",
        label: "Memory",
        icon: BrainIcon,
        path: "/ai-settings/memory",
      },
      {
        id: "file-media",
        label: "File & media",
        icon: TextIcon,
        path: "/ai-settings/file-media",
      },
      {
        id: "model",
        label: "Models",
        icon: ChipIcon,
        path: "/ai-settings/models",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "connector",
        label: "Connector",
        icon: PluginIcon,
        path: "/ai-settings/connector",
      },
      {
        id: "data-control",
        label: "Data Control",
        icon: DatabaseIcon,
        path: "/ai-settings/data-control",
      },
    ],
  },
];

export const workspaces: Workspace[] = [
  {
    id: 1,
    name: "Musharof Chy",
    plan: "Personal",
    initial: "M",
    colorClass: "bg-brand-400",
    image: "/images/user/owner.png",
  },
  {
    id: 2,
    name: "Leonardo Dicaprio",
    plan: "Business",
    initial: "L",
    colorClass: "bg-amber-400",
  },
];
