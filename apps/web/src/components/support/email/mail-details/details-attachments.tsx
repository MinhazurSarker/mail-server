"use client";

import { Button } from "@/components/ui/button";
import { DocIcon, DownloadIcon, FolderIcon, PaperClipIcon } from "@/icons";
import type { DetailsAttachmentsProps } from "./types";

export default function DetailsAttachments({
  attachments,
}: DetailsAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mx-4 mb-6 rounded-xl border border-gray-200 bg-gray-50/70 p-4 sm:mx-6 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="mb-3.5 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
        <PaperClipIcon className="size-4" />
        <span>{attachments.length} Attachments</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {attachments.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-xs dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                {file.type === "PDF" ? (
                  <DocIcon className="size-5" />
                ) : (
                  <FolderIcon className="size-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {file.type} • {file.size}
                </p>
              </div>
            </div>

            {file.url ? (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.name}
                className="inline-flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={`Download ${file.name}`}
              >
                <DownloadIcon className="size-4" />
              </a>
            ) : (
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Download ${file.name}`}
              >
                <DownloadIcon className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
