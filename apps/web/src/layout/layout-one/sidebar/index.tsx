"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { HorizontalDotsIcon, MinusIcon, PlusIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { sidebarOneItems } from "./data";
import type { SidebarOneMenuItem } from "./types";

export default function SidebarOne() {
  const { open, isMobile, isHovered } = useSidebar();
  const pathname = usePathname();
  const showContent = open || isHovered || isMobile;
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const pathKeys = findOpenKeys(sidebarOneItems, pathname);
    return pathKeys.length > 0 ? pathKeys : ["dashboard"];
  });
  const [previousPathname, setPreviousPathname] = useState(pathname);

  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    const pathKeys = findOpenKeys(sidebarOneItems, pathname);
    setOpenKeys(pathKeys.length > 0 ? pathKeys : ["dashboard"]);
  }

  const handleToggle = (key: string) => {
    setOpenKeys((current) =>
      current.includes(key)
        ? current.filter((openKey) => openKey !== key)
        : [...current, key],
    );
  };

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="px-5 pt-5 pb-7">
        <Link
          href="/"
          aria-label="Go to dashboard"
          className={cn(
            "flex items-center",
            !showContent ? "justify-center" : "justify-start",
          )}
        >
          {showContent ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={160}
                height={32}
                priority
                style={{ width: "auto", height: "auto" }}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={160}
                height={32}
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
              priority
              style={{ width: "auto", height: "auto", marginInline: "auto" }}
            />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-5 duration-300 ease-linear">
        <nav className="mb-6">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel
              className={cn(
                "mb-4 flex h-auto p-0 text-xs leading-5 text-gray-400 uppercase",
                !showContent ? "justify-center" : "justify-start",
              )}
            >
              {showContent ? "MENU" : <HorizontalDotsIcon className="size-6" />}
            </SidebarGroupLabel>
            <SidebarMenuItems
              items={sidebarOneItems}
              openKeys={openKeys}
              pathname={pathname}
              showContent={showContent}
              onToggle={handleToggle}
            />
          </SidebarGroup>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

const findOpenKeys = (
  items: SidebarOneMenuItem[],
  pathname: string,
  parents: string[] = [],
): string[] => {
  for (const item of items) {
    if (item.path === pathname) {
      return parents;
    }

    if (item.items) {
      const match = findOpenKeys(item.items, pathname, [...parents, item.key]);
      if (match.length > parents.length || match.includes(item.key)) {
        return match;
      }
    }
  }

  return [];
};

interface SidebarMenuItemsProps {
  items: SidebarOneMenuItem[];
  openKeys: string[];
  pathname: string;
  showContent: boolean;
  onToggle: (key: string) => void;
  level?: number;
}

function SidebarMenuItems({
  items,
  openKeys,
  pathname,
  showContent,
  onToggle,
  level = 0,
}: SidebarMenuItemsProps) {
  return (
    <SidebarMenu
      className={cn(
        "min-w-0 gap-1",
        level > 0 &&
          "ms-6 mt-2 w-auto border-s border-gray-200 ps-4 dark:border-gray-800",
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.items?.length);
        const isOpen = openKeys.includes(item.key);
        const isActive = item.path === pathname;
        const isBranchActive =
          hasChildren && findOpenKeys(item.items!, pathname).length > 0;

        if (hasChildren) {
          return (
            <SidebarMenuItem key={item.key}>
              <Collapsible
                className="w-full min-w-0"
                open={showContent && isOpen}
                onOpenChange={() => onToggle(item.key)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "group menu-item w-full min-w-0 cursor-pointer",
                    isOpen || isBranchActive
                      ? "menu-item-active"
                      : "menu-item-inactive",
                    !showContent && "justify-center",
                  )}
                >
                  {Icon && (
                    <Icon
                      className={
                        isOpen || isBranchActive
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }
                      width="24"
                      height="24"
                    />
                  )}
                  {showContent && (
                    <span className="menu-item-text min-w-0 truncate">
                      {item.label}
                    </span>
                  )}
                  {showContent && item.badge && (
                    <span className="ms-auto menu-dropdown-badge shrink-0 menu-dropdown-badge-inactive whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                  {showContent &&
                    (isOpen ? (
                      <MinusIcon className="ms-auto h-5 w-5 text-brand-500" />
                    ) : (
                      <PlusIcon className="ms-auto h-5 w-5" />
                    ))}
                </CollapsibleTrigger>
                <CollapsibleContent className="w-full min-w-0">
                  <SidebarMenuItems
                    items={item.items!}
                    openKeys={openKeys}
                    pathname={pathname}
                    showContent={showContent}
                    onToggle={onToggle}
                    level={level + 1}
                  />
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={item.key}>
            <Link
              href={item.path ?? "#"}
              className={cn(
                "group menu-dropdown-item w-full min-w-0",
                isActive
                  ? "menu-dropdown-item-active"
                  : "menu-dropdown-item-inactive",
                level === 0 && "menu-item",
                level === 0 &&
                  (isActive ? "menu-item-active" : "menu-item-inactive"),
              )}
            >
              {Icon && (
                <Icon
                  className="menu-item-icon-inactive"
                  width="24"
                  height="24"
                />
              )}
              {showContent && (
                <span
                  className={cn(
                    "min-w-0 truncate",
                    level === 0 && "menu-item-text",
                  )}
                >
                  {item.label}
                </span>
              )}
              {showContent && item.badge && (
                <span className="ms-auto menu-dropdown-badge shrink-0 menu-dropdown-badge-inactive whitespace-nowrap">
                  {item.badge}
                </span>
              )}
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
