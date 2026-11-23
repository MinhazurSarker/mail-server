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
import { ChevronDownIcon, HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { sidebarTwoNavGroups } from "./data";
import type { SidebarTwoMenuItem } from "./types";

export default function SidebarTwo() {
  const { open, isMobile, isHovered } = useSidebar();
  const pathname = usePathname();
  const showContent = open || isHovered || isMobile;

  const [selectedKey, setSelectedKey] = useState<string>("dashboard");
  const [openKeys, setOpenKeys] = useState<string[]>(["dashboard"]);

  const handleToggle = (key: string) => {
    setOpenKeys((current) =>
      current.includes(key)
        ? current.filter((openKey) => openKey !== key)
        : [...current, key],
    );
  };

  return (
    <Sidebar
      side="left"
      collapsible="icon"
      className="border-e border-gray-200 bg-gray-50 **:data-[sidebar=sidebar]:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 **:data-[sidebar=sidebar]:dark:bg-gray-900"
    >
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
        <nav className="mb-6 flex flex-col gap-6">
          {sidebarTwoNavGroups.map((group) => {
            const hasVisibleItems =
              showContent || group.items.some((item) => Boolean(item.icon));

            if (!hasVisibleItems) {
              return null;
            }

            return (
              <SidebarGroup key={group.group} className="p-0">
                <SidebarGroupLabel
                  className={cn(
                    "mb-3 flex h-auto p-0 text-xs leading-5 text-gray-500 uppercase dark:text-gray-400",
                    "group-data-[collapsible=icon]/sidebar:mt-0 group-data-[collapsible=icon]/sidebar:h-auto group-data-[collapsible=icon]/sidebar:opacity-100 [&>svg]:size-6",
                    !showContent ? "justify-center" : "justify-start ps-3",
                  )}
                >
                  {showContent ? (
                    group.group
                  ) : (
                    <HorizontalDotsIcon className="size-6" />
                  )}
                </SidebarGroupLabel>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => (
                    <SidebarTwoItem
                      key={item.key}
                      item={item}
                      showContent={showContent}
                      selectedKey={selectedKey}
                      openKeys={openKeys}
                      pathname={pathname}
                      onToggle={handleToggle}
                      onSelect={setSelectedKey}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

interface SidebarTwoItemProps {
  item: SidebarTwoMenuItem;
  showContent: boolean;
  selectedKey: string;
  openKeys: string[];
  pathname: string;
  onToggle: (key: string) => void;
  onSelect: (key: string) => void;
}

function SidebarTwoItem({
  item,
  showContent,
  selectedKey,
  openKeys,
  pathname,
  onToggle,
  onSelect,
}: SidebarTwoItemProps) {
  const Icon = item.icon;

  if (!showContent && !Icon) {
    return null;
  }

  const hasChildren = Boolean(item.items?.length);
  const isOpen = openKeys.includes(item.key);
  const hasActiveChild = Boolean(
    item.items?.some(
      (child) =>
        child.key === selectedKey ||
        Boolean(child.path && child.path !== "#" && pathname === child.path),
    ),
  );
  const isPathActive = Boolean(
    item.path && item.path !== "#" && pathname === item.path,
  );
  const isSelected = selectedKey === item.key || isPathActive || hasActiveChild;

  if (hasChildren) {
    return (
      <SidebarMenuItem key={item.key}>
        <Collapsible
          open={showContent && isOpen}
          onOpenChange={() => onToggle(item.key)}
        >
          <CollapsibleTrigger
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-full text-sm font-normal transition-colors",
              showContent ? "px-3 py-2" : "mx-auto size-10 justify-center px-0",
              isOpen || isSelected
                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
                : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/90",
            )}
          >
            {Icon && (
              <Icon className="size-5 shrink-0 stroke-[1.2px] transition-colors" />
            )}
            {showContent && (
              <span className="min-w-0 truncate">{item.label}</span>
            )}
            {showContent && (
              <ChevronDownIcon
                className={cn(
                  "ms-auto size-5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="w-full min-w-0">
            <ul className="ms-8 mt-2 flex flex-col space-y-1 border-s border-gray-200 ps-4 dark:border-gray-800">
              {item.items?.map((subItem) => {
                const isSubActive =
                  selectedKey === subItem.key ||
                  Boolean(
                    subItem.path &&
                    subItem.path !== "#" &&
                    pathname === subItem.path,
                  );
                return (
                  <li key={subItem.key}>
                    <Link
                      href={subItem.path ?? "#"}
                      onClick={() => onSelect(subItem.key)}
                      className={cn(
                        "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                        isSubActive
                          ? "font-medium text-gray-800 dark:text-white/90"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90",
                      )}
                    >
                      {subItem.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem key={item.key}>
      <Link
        href={item.path ?? "#"}
        onClick={() => onSelect(item.key)}
        className={cn(
          "flex w-full items-center gap-2 rounded-full text-sm font-normal transition-colors",
          showContent ? "px-3 py-2" : "mx-auto size-10 justify-center px-0",
          isSelected
            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
            : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/90",
        )}
      >
        {Icon && (
          <Icon className="size-5 shrink-0 stroke-[1.2px] transition-colors" />
        )}
        {showContent && <span className="min-w-0 truncate">{item.label}</span>}
      </Link>
    </SidebarMenuItem>
  );
}
