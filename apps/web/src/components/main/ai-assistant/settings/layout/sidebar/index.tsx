"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { XIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";
import { workspaces } from "../data";
import SidebarBody from "./sidebar-body";
import SidebarHeader from "./sidebar-header";
import type { SettingsSidebarProps, Workspace } from "./types";

export default function SettingsSidebar({ className }: SettingsSidebarProps) {
  const { openMobile, setOpenMobile } = useSidebar();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(
    workspaces[0],
  );

  const handleClose = () => {
    setOpenMobile(false);
  };

  return (
    <>
      {/* Desktop Sidebar: in-flow right sidebar, width 250px (w-62.5 / w-[250px]) */}
      <Sidebar
        side="right"
        collapsible="none"
        className={cn(
          "hidden h-full w-62.5 shrink-0 border-e border-gray-200 bg-white text-gray-900 xl:flex dark:border-gray-800 dark:bg-gray-900",
          className,
        )}
      >
        <SidebarHeader
          selectedWorkspace={selectedWorkspace}
          onSelectWorkspace={setSelectedWorkspace}
        />
        <SidebarBody />
      </Sidebar>

      {/* Mobile Drawer (Sheet): synced to useSidebar openMobile, slides from right */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-62.5 border-s border-gray-200 bg-white p-0 text-gray-900 dark:border-gray-800 dark:bg-gray-900"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>AI Settings Navigation</SheetTitle>
            <SheetDescription>
              Navigation menu for AI settings sections
            </SheetDescription>
          </SheetHeader>

          {/* Floating close button outside drawer (matching Figma node 6925:18140) */}
          <Button
            size="icon-lg"
            onClick={handleClose}
            className="absolute -inset-s-13 top-2 rounded-full bg-white text-gray-700 shadow-theme-md transition hover:bg-gray-50 focus:outline-hidden dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Close settings menu"
          >
            <XIcon className="size-6 **:stroke-[1.5px]" />
          </Button>

          <SidebarHeader
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={setSelectedWorkspace}
          />
          <SidebarBody onCloseMobile={handleClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}
