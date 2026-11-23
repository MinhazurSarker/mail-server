"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { GlobeIcon, PlusIcon, TelescopeIcon, UploadIcon } from "@/icons";
import { TextControlsProps } from "./types";

export default function TextControls({
  searchMode,
  onSearchModeChange,
  onUploadClick,
}: TextControlsProps) {
  return (
    <>
      {/* Plus Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Add options"
              className="border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <PlusIcon className="size-5" />
            </Button>
          }
        />
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-44 min-w-0 p-1.5"
        >
          <DropdownMenuItem onClick={onUploadClick} className="gap-2.5">
            <UploadIcon className="size-4.5" />
            <span>Upload File</span>
          </DropdownMenuItem>
          <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />
          <DropdownMenuItem
            onClick={() => onSearchModeChange("web")}
            className={`gap-2.5 ${searchMode === "web" ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
          >
            <GlobeIcon className="size-4.5" />
            <span>Web Search</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSearchModeChange("deep")}
            className={`gap-2.5 ${searchMode === "deep" ? "bg-gray-100 font-medium dark:bg-gray-800" : ""}`}
          >
            <TelescopeIcon className="size-4.5" />
            <span>Deep Research</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Search Mode Pill */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          onSearchModeChange(searchMode === "web" ? "deep" : "web")
        }
        className="h-9 gap-2 px-2 text-sm font-medium text-brand-500 hover:bg-brand-50/50 hover:text-brand-600 dark:hover:bg-brand-950/30 dark:hover:text-brand-400"
      >
        {searchMode === "web" ? (
          <GlobeIcon className="size-4.5" />
        ) : (
          <TelescopeIcon className="size-4.5" />
        )}
        <span>{searchMode === "web" ? "Web Search" : "Deep Research"}</span>
      </Button>
    </>
  );
}
