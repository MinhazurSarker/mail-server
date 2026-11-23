"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon, ShareIcon } from "@/icons";
import { useState } from "react";
import ChatDropdown from "./chat-dropdown";
import ShareChatDialog from "./share-chat-dialog";

import { cn } from "@/utils";

interface AiHeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

export default function AiHeader({
  onToggleSidebar,
  className,
}: AiHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const [shareOpen, setShareOpen] = useState(false);

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <header
      className={cn(
        "w-full shrink-0 border-b border-gray-200 bg-white xl:border-none dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-180 items-center justify-between px-4 md:px-0">
        {/* Left: Chat Title with Dropdown Menu */}
        <div className="flex items-center">
          <ChatDropdown />
        </div>

        {/* Right: Share Button & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="h-9 gap-1.5 rounded-[10px] px-3 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ShareIcon className="size-4" />
            <span>Share</span>
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleToggle}
            className="h-9 rounded-[10px] text-gray-700 hover:text-gray-900 xl:hidden dark:text-gray-300 dark:hover:text-white"
            aria-label="Toggle Chat History"
          >
            <MenuIcon className="size-5" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <ShareChatDialog open={shareOpen} onOpenChange={setShareOpen} />
    </header>
  );
}
