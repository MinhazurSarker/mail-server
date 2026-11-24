"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BellIcon, DotIcon, XIcon, InfoCircleIcon, LockIcon } from "@/icons";
import { cn } from "@/utils";
import { notifications as initialNotifications } from "./data";
import type { NotificationItem } from "./types";

export default function NotificationDropdown() {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(
    initialNotifications.some((n) => !n.read)
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setNotifying(false);
    }
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setNotifying(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            className="relative"
            aria-label="Toggle notifications"
          >
            <span
              className={cn(
                "absolute inset-e-0 -top-0.5 z-10 h-2 w-2 translate-x-1/2 rounded-full bg-orange-400",
                !notifying ? "hidden" : "flex",
              )}
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            </span>
            <BellIcon className="size-auto!" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-87.5 overflow-hidden p-3 sm:w-90.25 dark:bg-[#1E2635]"
      >
        <div className="flex items-center justify-between pb-3">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-3">
              <BellIcon className="size-5" />
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              No new notifications
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-[240px]">
              You're all caught up! Mailbox notices and security alerts will appear here.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-80">
              <div className="flex flex-col pe-2 py-1">
                {items.map((item) => (
                  <div key={item.id}>
                    <DropdownMenuItem className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-950/40 dark:text-brand-400 mt-0.5">
                        {item.type === "security" ? (
                          <LockIcon className="size-4" />
                        ) : (
                          <InfoCircleIcon className="size-4" />
                        )}
                      </div>
                      <div className="flex-1 text-start min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-0.5 bg-gray-100 last-of-type:hidden dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleMarkAllRead}
                className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
