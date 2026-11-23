"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { docsNavSections, docsVersions } from "./data";
import VersionDropdown from "./version-dropdown";

export default function SidebarFive() {
  const { openMobile, setOpenMobile } = useSidebar();

  const [activeVersion, setActiveVersion] = useState(docsVersions[1]);
  const [selected, setSelected] = useState("FrameworkGuides");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(docsNavSections.map((section) => [section.id, true])),
  );

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

      <SidebarContent className="overflow-y-auto pe-0.5 duration-300 ease-linear">
        <ScrollArea className="h-full">
          <nav className="mb-6 flex flex-col pb-10">
            {docsNavSections.map((section) => {
              const isOpen = openSections[section.id] ?? true;
              return (
                <Collapsible
                  key={section.id}
                  open={isOpen}
                  onOpenChange={(open) => toggleSection(section.id, open)}
                  className="w-full"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between px-5 py-3 text-sm font-normal text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
                    )}
                  >
                    <span>{section.label}</span>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ms-5 flex flex-col gap-3 border-s border-gray-200 py-1 dark:border-gray-700">
                      {section.items.map((item) => {
                        const isSelected = selected === item.id;
                        return (
                          <li key={item.id}>
                            <a
                              href={item.href ?? "#"}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSelect(item.id);
                              }}
                              className={cn(
                                "docs-border-item cursor-pointer",
                                isSelected
                                  ? "docs-border-item-active"
                                  : "docs-border-item-inactive",
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
          <ScrollBar />
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
