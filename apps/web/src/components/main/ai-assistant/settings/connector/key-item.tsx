"use client";

import { Button } from "@/components/ui/button";
import { KeyIcon } from "@/icons/key";
import React from "react";

export interface KeyItemProps {
  title: string;
  keyValue: string;
  onRotate?: () => void;
  onRevoke?: () => void;
  isLast?: boolean;
}

export default function KeyItem({
  title,
  keyValue,
  onRotate,
  onRevoke,
  isLast = false,
}: KeyItemProps) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
        !isLast ? "border-b border-gray-100 dark:border-gray-800" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5 text-start">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {keyValue}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRotate}
        >
          <KeyIcon className="size-5" />
          <span>Rotate</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRevoke}
          className="border-red-300 text-red-500 shadow-theme-xs hover:bg-red-50 hover:text-red-600 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Revoke
        </Button>
      </div>
    </div>
  );
}
