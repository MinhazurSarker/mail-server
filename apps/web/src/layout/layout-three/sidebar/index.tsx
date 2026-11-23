"use client";

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
import { Link } from "@/i18n/navigation";
import { SearchIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { docsNavSections, docsVersions } from "./data";
import VersionDropdown from "./version-dropdown";

export default function SidebarThree() {
  const { openMobile, setOpenMobile } = useSidebar();

  const [activeVersion, setActiveVersion] = useState(docsVersions[1]);
  const [selected, setSelected] = useState("QuickStart");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id: string) => {
    setSelected(id);
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  const filteredSections = searchQuery.trim()
    ? docsNavSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((section) => section.items.length > 0)
    : docsNavSections;

  return (
    <Sidebar
      side="left"
      collapsible="offcanvas"
      className="border-e border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <SidebarHeader className="p-0">
        <div className="px-5 py-5">
          <div className="relative flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <Link href="/" className="shrink-0" aria-label="Go to homepage">
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="size-8"
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                  TailAdmin Docs
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {activeVersion}
                </span>
              </div>
            </div>

            <VersionDropdown
              versions={docsVersions}
              activeVersion={activeVersion}
              onSelectVersion={setActiveVersion}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-5 duration-300 ease-linear">
        <div className="pb-4">
          <div className="relative">
            <span className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="size-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search the docs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 ps-9 pe-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-800 dark:bg-white/3 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>

        <nav className="mb-6 flex flex-col gap-6">
          {filteredSections.map((section) => (
            <SidebarGroup key={section.group} className="p-0">
              <SidebarGroupLabel className="mb-2 flex h-auto p-0 px-3 text-xs font-medium text-gray-800 dark:text-white/90">
                {section.group}
              </SidebarGroupLabel>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isSelected = selected === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <a
                        href={item.href ?? "#"}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(item.id);
                        }}
                        className={cn(
                          "docs-menu-item cursor-pointer",
                          isSelected
                            ? "docs-menu-item-active"
                            : "docs-menu-item-inactive",
                        )}
                      >
                        <span className="truncate">{item.label}</span>
                      </a>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
