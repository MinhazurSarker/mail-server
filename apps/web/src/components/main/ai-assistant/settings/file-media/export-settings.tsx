"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Slider } from "@/components/ui/slider";
import { ChevronDownIcon } from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";

const exportFormats = ["PNG", "JPEG", "PDF", "WEBP"];

export default function ExportSettings() {
  const [selectedFormat, setSelectedFormat] = useState("PNG");
  const [compressionQuality, setCompressionQuality] = useState(60);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Export Settings
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Default export format */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Default export format
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <span>{selectedFormat}</span>
              <ChevronDownIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-32 min-w-28 p-1.5">
              {exportFormats.map((format) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
                    selectedFormat === format &&
                      "bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white",
                  )}
                >
                  {format}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Compression quality */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Compression quality
            </h3>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-62.5">
            <Slider
              value={[compressionQuality]}
              onValueChange={(val) => {
                const nextVal = Array.isArray(val) ? val[0] : val;
                if (typeof nextVal === "number") {
                  setCompressionQuality(nextVal);
                }
              }}
              min={0}
              max={100}
              className="flex-1"
            />
            <span className="min-w-9 text-end text-sm font-medium text-gray-700 dark:text-gray-300">
              {compressionQuality}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
