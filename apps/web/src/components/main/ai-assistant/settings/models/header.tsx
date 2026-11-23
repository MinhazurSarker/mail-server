"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDownIcon, SearchIcon } from "@/icons";
import { cn } from "@/utils";
import { GENERATION_OPTIONS, PROVIDER_OPTIONS } from "./data";

interface ModelsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  provider: string;
  onProviderChange: (value: string) => void;
  generation: string;
  onGenerationChange: (value: string) => void;
}

export default function ModelsHeader({
  search,
  onSearchChange,
  provider,
  onProviderChange,
  generation,
  onGenerationChange,
}: ModelsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-gray-800">
      {/* Search Input */}
      <div className="w-full flex-1">
        <InputGroup className="h-10 rounded-lg border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <InputGroupAddon
            align="inline-start"
            className="ps-3 text-gray-500 dark:text-gray-400"
          >
            <SearchIcon className="size-5" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Model ..."
            className="text-sm text-gray-800 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-white/30"
          />
        </InputGroup>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
        {/* Provider Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <span>{provider === "All" ? "Provider" : provider}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {PROVIDER_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onProviderChange(option)}
                className={cn(
                  "cursor-pointer",
                  provider === option &&
                    "bg-gray-100 font-medium text-gray-900 dark:bg-white/5 dark:text-white",
                )}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Generation Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <span>{generation === "All" ? "All Generation" : generation}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            {GENERATION_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onGenerationChange(option)}
                className={cn(
                  "cursor-pointer",
                  generation === option &&
                    "bg-gray-100 font-medium text-gray-900 dark:bg-white/5 dark:text-white",
                )}
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
