"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { navGroups } from "../data";
import type { SidebarBodyProps } from "./types";

export default function SidebarBody({
  onCloseMobile,
  className,
}: SidebarBodyProps) {
  const pathname = usePathname();

  return (
    <SidebarContent className={cn("gap-4 p-3", className)}>
      {navGroups.map((group) => (
        <SidebarGroup key={group.title} className="p-0">
          <SidebarGroupLabel className="h-auto px-3 py-1 text-xs font-normal text-gray-400 dark:text-gray-500">
            {group.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.path ||
                  (item.id === "account" && pathname === "/ai-settings");

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      render={<Link href={item.path} onClick={onCloseMobile} />}
                      isActive={isActive}
                      className={cn(
                        "flex h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition",
                        "[&_path]:stroke-[1.3px] [&_svg]:size-5 [&_svg_*]:stroke-[1.3px]",
                        isActive
                          ? "bg-gray-100 font-medium text-gray-800 dark:bg-white/5 dark:text-white/90"
                          : "font-normal text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 [&_svg]:text-[#6A7282] hover:[&_svg]:text-gray-700 dark:hover:[&_svg]:text-white/90",
                      )}
                    >
                      <Icon className="size-5 shrink-0 stroke-[1.3px]" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}
