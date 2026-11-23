"use client";

import { Button } from "@/components/ui/button";
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
import { SearchIcon, UploadIcon } from "@/icons";
import { cn } from "@/utils";
import { TransactionCardHeaderProps } from "./types";

export default function CardHeader({
  title = "Transactions",
  description = "Your most recent transactions list",
  searchQuery = "",
  onSearchChange,
  selectedRange = "7-days",
  onRangeChange,
  onExportCsv,
  className = "",
}: TransactionCardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-64 md:w-72">
          <InputGroup className="h-11 rounded-[10px] border-gray-300 dark:border-gray-700">
            <InputGroupAddon align="inline-start" className="ps-3 text-gray-500 dark:text-gray-400">
              <SearchIcon className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="text-sm font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </InputGroup>
        </div>

        {/* Date Filter Select */}
        <div className="w-36 shrink-0 sm:w-40">
          <Select
            value={selectedRange}
            onValueChange={(val) => onRangeChange?.(val ?? "7-days")}
          >
            <SelectTrigger
              size="default"
              className="h-11 rounded-[10px] border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-days">Last 7 days</SelectItem>
              <SelectItem value="30-days">Last 30 days</SelectItem>
              <SelectItem value="3-months">Last 3 months</SelectItem>
              <SelectItem value="1-year">Last 1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export CSV Button */}
        <Button
          variant="outline"
          size="default"
          onClick={onExportCsv}
          className="h-11 shrink-0 rounded-[10px] border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
        >
          <UploadIcon className="size-5" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}
