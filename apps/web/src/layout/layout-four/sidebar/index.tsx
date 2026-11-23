"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { ChevronDownIcon, SearchIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { docsNavSections, docsVersions } from "./data";
import VersionDropdown from "./version-dropdown";

export default function SidebarFour() {
  const { openMobile, setOpenMobile } = useSidebar();

  const [activeVersion, setActiveVersion] = useState(docsVersions[1]);
  const [selected, setSelected] = useState("InstallationGuide");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(docsNavSections.map((section) => [section.id, true])),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id: string) => {
    setSelected(id);
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  const toggleSection = (id: string, open?: boolean) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: open !== undefined ? open : !prev[id],
    }));
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

        <div className="px-5 pb-4">
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
      </SidebarHeader>

      <SidebarContent className="overflow-hidden p-0 pe-px duration-300 ease-linear">
        <ScrollArea className="h-full">
          <nav className="mb-6 flex flex-col gap-1 px-5">
            {filteredSections.map((section) => {
              const isOpen = searchQuery.trim()
                ? true
                : (openSections[section.id] ?? true);
              return (
                <Collapsible
                  key={section.id}
                  open={isOpen}
                  onOpenChange={(open) => toggleSection(section.id, open)}
                  className="w-full"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-1.5 text-sm font-normal text-gray-800 transition-colors hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-800",
                    )}
                  >
                    <span>{section.label}</span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-gray-500 transition-transform duration-200 dark:text-gray-400",
                        isOpen && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="flex flex-col py-2">
                      {section.items.map((item) => {
                        const isSelected = selected === item.id;
                        return (
                          <li
                            key={item.id}
                            className="rounded-lg px-5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <a
                              href={item.href ?? "#"}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.id);
                              }}
                              className={cn(
                                "block text-sm transition-colors",
                                isSelected
                                  ? "font-medium text-brand-500"
                                  : "text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400",
                              )}
                            >
                              {item.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
