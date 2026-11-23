"use client";

import { Button } from "@/components/ui/button";
import { CardTitle, CardHeader as Header } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon, UploadIcon } from "@/icons";
import * as React from "react";

interface CardHeaderProps {
  onSearch?: (query: string) => void;
  onUpload?: () => void;
}

export default function CardHeader({ onSearch, onUpload }: CardHeaderProps) {
  const [query, setQuery] = React.useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  return (
    <Header className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
        All Media
      </CardTitle>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto">
          <span className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <SearchIcon className="size-5" />
          </span>
          <Input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleSearchChange}
            className="h-11 w-full rounded-lg ps-10.5 pe-3.5 xl:w-75"
          />
        </div>

        <Button
          onClick={onUpload}
          className="h-11 w-full gap-2 px-4 text-sm font-medium sm:w-auto"
        >
          <UploadIcon className="size-5" />
          Upload File
        </Button>
      </div>
    </Header>
  );
}
