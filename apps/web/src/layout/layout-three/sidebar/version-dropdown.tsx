"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronUpDownIcon } from "@/icons";
import type { DocsVersion, VersionDropdownProps } from "./types";

export default function VersionDropdown({
  versions,
  activeVersion,
  onSelectVersion,
}: VersionDropdownProps) {
  return (
    <div className="ms-auto">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Toggle version selection"
              className="inline-flex size-5 items-center justify-center rounded-md border border-gray-200 text-gray-800 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            />
          }
        >
          <ChevronUpDownIcon className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 min-w-0 p-1.5">
          <DropdownMenuRadioGroup
            value={activeVersion}
            onValueChange={(val) => onSelectVersion(val as DocsVersion)}
          >
            {versions.map((version) => (
              <DropdownMenuRadioItem
                key={version}
                value={version}
                closeOnClick
                onClick={() => onSelectVersion(version)}
                className="py-2"
              >
                {version}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
