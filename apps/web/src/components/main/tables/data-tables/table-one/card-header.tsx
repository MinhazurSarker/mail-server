"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "@/icons";

export interface CardHeaderProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pageSizeOptions?: number[];
}

export default function CardHeader({
  pageSize,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  pageSizeOptions = [5, 10, 20, 50],
}: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Page Size Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Show
        </span>
        <div className="w-18.5 shrink-0">
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              if (val) onPageSizeChange(Number(val));
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-9 w-full rounded-lg border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600"
              aria-label="Select entries per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-18.5 rounded-lg p-1">
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className="py-1.5 ps-3 pe-8 text-sm"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          entries
        </span>
      </div>

      {/* Global Search Input */}
      <div className="w-full sm:w-64 md:w-72">
        <InputGroup className="h-10 rounded-[10px] border-gray-300 dark:border-gray-700">
          <InputGroupAddon className="ps-3.5 pe-0">
            <SearchIcon className="size-5 text-gray-500 dark:text-gray-400" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </InputGroup>
      </div>
    </div>
  );
}
