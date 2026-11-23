"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HorizontalSlideIcon, SearchIcon } from "@/icons";
import { useEffect, useRef, useState } from "react";

export interface ProductListFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedStock?: string;
  onStockChange?: (stock: string) => void;
  categories?: string[];
  onResetFilters?: () => void;
}

export default function ProductListFilter({
  search,
  onSearchChange,
  selectedCategory = "all",
  onCategoryChange,
  selectedStock = "all",
  onStockChange,
  categories = [
    "Laptop",
    "Watch",
    "Phone",
    "Electronics",
    "Accessories",
    "Audio",
    "Tablet",
    "Camera",
    "Gaming",
    "Monitor",
    "Storage",
  ],
  onResetFilters,
}: ProductListFilterProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    selectedCategory !== "all" || selectedStock !== "all";

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
      <div className="w-full sm:max-w-xs">
        <InputGroup className="w-full">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="size-5 text-gray-400 dark:text-gray-500" />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="relative" ref={filterDropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilterDropdown((prev) => !prev)}
          className={
            hasActiveFilters
              ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
              : ""
          }
        >
          <HorizontalSlideIcon className="size-5" />
          Filter
          {hasActiveFilters && (
            <span className="flex size-2 rounded-full bg-brand-500" />
          )}
        </Button>

        {showFilterDropdown && (
          <div className="absolute inset-e-0 z-99 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Stock Status
              </label>
              <select
                value={selectedStock}
                onChange={(e) => onStockChange?.(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                className="flex-1"
                onClick={() => {
                  onResetFilters?.();
                  setShowFilterDropdown(false);
                }}
              >
                Reset
              </Button>
              <Button
                size="xs"
                className="flex-1"
                onClick={() => setShowFilterDropdown(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
