"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";

const RETENTION_OPTIONS = [
  "All Time",
  "30 Days",
  "90 Days",
  "180 Days",
  "1 year",
] as const;

export default function Privacy() {
  const [retention, setRetention] = useState<string>("90 Days");
  const [improveModels, setImproveModels] = useState<boolean>(false);
  const [location, setLocation] = useState<boolean>(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Privacy
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Data retention */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Data retention
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How long to keep your conversations
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <span>{retention}</span>
              <ChevronDownIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="min-w-36 rounded-xl p-1.5 shadow-theme-lg"
            >
              {RETENTION_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setRetention(option)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    retention === option
                      ? "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                  )}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Improve models with my data */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Improve models with my data
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Opt in to training on anonymized chats.
            </p>
          </div>

          <Switch
            size="sm"
            checked={improveModels}
            onCheckedChange={setImproveModels}
            aria-label="Improve models with my data"
          />
        </div>

        {/* Location */}
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Location
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When on, AI uses your location for local info.
            </p>
          </div>

          <Switch
            size="sm"
            checked={location}
            onCheckedChange={setLocation}
            aria-label="Location"
          />
        </div>
      </div>
    </section>
  );
}
