"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { navItems } from "./data";

export default function SidebarSix() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const [activeNav, setActiveNav] = useState("dashboard");

  const handleSelect = (id: string) => {
    setActiveNav(id);
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      side="left"
      collapsible="offcanvas"
      className="w-23! border-e border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
    >
      <SidebarHeader className="p-0">
        {isMobile ? (
          <div className="flex items-center gap-3 px-5 py-5">
            <Link
              href="/"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500"
              aria-label="Go to homepage"
            >
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
                TailAdmin
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                Layout Six
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center pt-5 pb-4">
            <Link
              href="/"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500"
              aria-label="Go to homepage"
            >
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
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto px-2 duration-300 ease-linear">
        <ScrollArea className="h-full">
          {isMobile ? (
            /* Mobile drawer view: Icon + Text Label */
            <nav className="flex flex-col gap-1 px-3 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors",
                      isActive
                        ? "bg-brand-50 font-medium text-brand-500 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                        isActive
                          ? "border-brand-200 bg-white text-brand-500 shadow-theme-xs dark:border-brand-800 dark:bg-gray-900"
                          : "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Desktop view: Icon-only with hover tooltips (strictly fixed width, does not widen on hover) */
            <nav className="flex flex-col items-center gap-1.5 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => handleSelect(item.id)}
                          className={cn(
                            "nav-icon-item cursor-pointer",
                            isActive
                              ? "nav-icon-item-active"
                              : "nav-icon-item-inactive",
                          )}
                          aria-label={item.label}
                        >
                          <Icon className="size-5" />
                        </button>
                      }
                    />
                    <TooltipContent side="inline-end" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
