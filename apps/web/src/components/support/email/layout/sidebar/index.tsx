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
import SidebarBody from "./sidebar-body";
import SidebarHeader from "./sidebar-header";
import type { InboxSidebarProps } from "./types";

export default function InboxSidebar({
  className,
  onCompose,
  activeFolder,
  onSelectFolder,
  activeLabel,
  onSelectLabel,
  counts,
}: InboxSidebarProps) {
  const { openMobile, setOpenMobile } = useSidebar();

  const handleClose = () => {
    setOpenMobile(false);
  };

  return (
    <>
      {/* Desktop Sidebar: in-flow left sidebar */}
      <Sidebar
        side="left"
        collapsible="none"
        className={cn(
          "hidden h-full w-65 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 xl:flex dark:border-gray-800 dark:bg-gray-900",
          className
        )}
      >
        <SidebarHeader onCompose={onCompose} />
        <SidebarBody
          activeFolder={activeFolder}
          onSelectFolder={onSelectFolder}
          activeLabel={activeLabel}
          onSelectLabel={onSelectLabel}
          counts={counts}
        />
      </Sidebar>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-65 flex-col border-e border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-800 dark:bg-gray-900"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Email Navigation</SheetTitle>
            <SheetDescription>
              Folders, filters, and labels navigation menu
            </SheetDescription>
          </SheetHeader>

          <Button
            size="icon-lg"
            onClick={handleClose}
            className="absolute -inset-e-13 top-2 rounded-full bg-white text-gray-700 shadow-theme-md transition hover:bg-gray-50 focus:outline-hidden dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Close email menu"
          >
            <XIcon className="size-6 **:stroke-[1.5px]" />
          </Button>

          <SidebarHeader onCompose={() => { handleClose(); onCompose?.(); }} />
          <SidebarBody
            onCloseMobile={handleClose}
            activeFolder={activeFolder}
            onSelectFolder={onSelectFolder}
            activeLabel={activeLabel}
            onSelectLabel={onSelectLabel}
            counts={counts}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
