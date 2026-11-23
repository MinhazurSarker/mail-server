"use client";

import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const allowedFormats = ["PNG", "JPG", "PDF", "MP4", "MD", "ZIP"];

export default function UploadSettings() {
  const [maxFileSize, setMaxFileSize] = useState(20);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Upload Settings
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Max file size */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Max file size
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maximum upload size (50 MB).
            </p>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-80">
            <Slider
              value={[maxFileSize]}
              onValueChange={(val) => {
                const nextVal = Array.isArray(val) ? val[0] : val;
                if (typeof nextVal === "number") {
                  setMaxFileSize(nextVal);
                }
              }}
              min={0}
              max={100}
              className="flex-1"
            />
            <span className="min-w-9 text-end text-sm font-medium text-gray-700 dark:text-gray-300">
              {maxFileSize}%
            </span>
          </div>
        </div>

        {/* Allowed formats */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Allowed formats
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allowedFormats.map((format) => (
              <Badge
                key={format}
                variant="light"
                color="light"
                size="sm"
                className="rounded-full px-2.5 py-1 text-xs font-normal text-gray-500 dark:text-gray-400"
              >
                {format}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
