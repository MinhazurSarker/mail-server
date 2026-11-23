"use client";

import { FilterIcon } from "@/components/main/task/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, UploadIcon } from "@/icons";
import { cn } from "@/utils";
import { InvoiceCardHeaderProps, InvoiceStatusFilter } from "./types";

export default function CardHeader({
  title = "Invoices",
  description = "Your most recent invoices list",
  searchTerm = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  onFilter,
  onExport,
  className = "",
}: InvoiceCardHeaderProps) {
  const tabs: { label: string; value: InvoiceStatusFilter }[] = [
    { label: "All Invoices", value: "all" },
    { label: "Unpaid", value: "unpaid" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      {/* Title & Description */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-title-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Tab Group */}
        <ButtonGroup className="gap-0.5 rounded-lg bg-gray-100 p-0.5 *:data-slot:rounded-md! dark:bg-gray-800">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <Button
                key={tab.value}
                variant="ghost"
                size="sm"
                onClick={() => onStatusFilterChange?.(tab.value)}
                className={cn(
                  "h-9 px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-gray-900 shadow-theme-xs hover:bg-white hover:text-gray-900 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                    : "text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white",
                )}
              >
                {tab.label}
              </Button>
            );
          })}
        </ButtonGroup>

        {/* Search Field */}
        <div className="w-full sm:w-56">
          <InputGroup className="h-10">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-5 text-gray-400 dark:text-gray-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="text-sm text-gray-800 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </InputGroup>
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          size="default"
          onClick={onFilter}
          className="h-10 rounded-[10px] border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
        >
          <FilterIcon className="size-5" />
          <span>Filter</span>
        </Button>

        {/* Export Button */}
        <Button
          variant="outline"
          size="default"
          onClick={onExport}
          className="h-10 rounded-[10px] border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
        >
          <UploadIcon className="size-5" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
}
