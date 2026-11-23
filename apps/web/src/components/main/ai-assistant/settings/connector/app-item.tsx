"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/icons";
import React from "react";

export interface AppItemProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected?: boolean;
  onToggle?: () => void;
  isLast?: boolean;
}

export default function AppItem({
  name,
  description,
  icon,
  connected = false,
  onToggle,
  isLast = false,
}: AppItemProps) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
        !isLast ? "border-b border-gray-100 dark:border-gray-800" : ""
      }`}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          {icon}
        </div>

        <div className="flex min-w-0 flex-col gap-0.5 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              {name}
            </h3>
            {connected && (
              <Badge variant="light" color="success" size="sm">
                Connected
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center">
        {connected ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="border-red-300 text-red-500 shadow-theme-xs hover:bg-red-50 hover:text-red-600 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggle}
          >
            <PlusIcon className="size-5" />
            <span>Connect</span>
          </Button>
        )}
      </div>
    </div>
  );
}
