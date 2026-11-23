"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadIcon, PlayIcon, RegenerateIcon } from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { VideoCardProps } from "./types";

export default function VideoCard({
  thumbnailSrc,
  videoUrl,
  alt = "",
  onRegenerate,
  onDownload,
  className,
}: VideoCardProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = videoUrl.split("/").pop() || "generated-video.mp4";
    link.click();
  };

  return (
    <div
      className={cn(
        "group relative w-full max-w-100 overflow-hidden rounded-xl",
        className,
      )}
    >
      <Image
        src={thumbnailSrc}
        width={400}
        height={300}
        className="w-full rounded-xl border border-gray-100 object-cover dark:border-gray-700"
        alt={alt}
      />
      <a
        href={videoUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-s-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 backdrop-blur-[10px] transition hover:bg-white/60 rtl:translate-x-1/2"
        aria-label="Play video"
      >
        <PlayIcon className="size-7 text-[#344054]" />
      </a>
      <div className="absolute inset-e-0 top-0 flex -translate-y-full items-center justify-between px-3 py-3 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center gap-2">
          {/* Regenerate Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                  aria-label="Regenerate video"
                >
                  <RegenerateIcon className="size-4" />
                </button>
              }
            />
            <TooltipContent>Regenerate</TooltipContent>
          </Tooltip>

          {/* Download Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                  aria-label="Download video"
                >
                  <DownloadIcon className="size-4.5" />
                </button>
              }
            />
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
