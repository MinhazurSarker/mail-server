"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/utils";
import SidebarBody from "./sidebar-body";
import { AiSidebarProps } from "./types";

export default function AiSidebar({
  isOpenMobile,
  onCloseMobile,
  onNewChat,
  activeChatId = "s2",
  onSelectChat,
  onRename,
  onDelete,
  onToggleStar,
  className,
}: AiSidebarProps) {
  const { openMobile, setOpenMobile } = useSidebar();
  const isDrawerOpen = isOpenMobile !== undefined ? isOpenMobile : openMobile;

  const handleClose = () => {
    setOpenMobile(false);
    onCloseMobile?.();
  };

  const handleSelect = (id: string) => {
    onSelectChat?.(id);
    handleClose();
  };

  return (
    <>
      {/* Desktop Sidebar: matches sheet width (24rem / 384px / w-96) */}
      <Sidebar
        side="right"
        collapsible="none"
        style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
        className={cn(
          "hidden h-full w-96 shrink-0 border-s border-e-0 border-gray-200 bg-white text-gray-900 xl:flex dark:border-gray-800 dark:bg-gray-900",
          className,
        )}
      >
        <SidebarBody
          onNewChat={onNewChat}
          activeChatId={activeChatId}
          onSelectChat={handleSelect}
          onRename={onRename}
          onDelete={onDelete}
          onToggleStar={onToggleStar}
        />
      </Sidebar>

      {/* Mobile Drawer (Sheet): synced to w-full sm:max-w-sm (24rem / 384px) */}
      <Sheet
        open={isDrawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          } else {
            setOpenMobile(true);
          }
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-sm border-s border-e-0 border-gray-200 bg-white p-0 text-gray-900 dark:border-gray-800 dark:bg-gray-900"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Chat History</SheetTitle>
            <SheetDescription>
              View and search past AI chat history
            </SheetDescription>
          </SheetHeader>
          <SidebarBody
            onNewChat={onNewChat}
            activeChatId={activeChatId}
            onSelectChat={handleSelect}
            onRename={onRename}
            onDelete={onDelete}
            onToggleStar={onToggleStar}
            onCloseMobile={handleClose}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
