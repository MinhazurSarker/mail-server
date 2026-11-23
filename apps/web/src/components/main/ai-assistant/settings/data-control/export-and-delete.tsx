"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon, TrashBinIcon } from "@/icons";

export default function ExportAndDelete() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Export & Delete
      </h2>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Export user data */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Export user data
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Download a ZIP of all chats and files.
            </p>
          </div>

          <Button type="button" variant="outline" size="sm">
            <DownloadIcon className="size-5" />
            <span>Request Export</span>
          </Button>
        </div>

        {/* Delete all chat */}
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 text-start">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Delete all chat
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Permanently remove the entire chats
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-red-300 text-red-500 shadow-theme-xs hover:bg-red-50 hover:text-red-600 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <TrashBinIcon className="size-5 text-red-500 dark:text-red-400" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
