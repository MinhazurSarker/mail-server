"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  PencilIcon,
  RegenerateIcon,
} from "@/icons";
import { cn } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { ImageCardProps } from "./types";

export default function ImageCard({
  src,
  alt = "",
  onEdit,
  onRegenerate,
  onCopy,
  onDownload,
  className,
}: ImageCardProps) {
  const [copiedImage, setCopiedImage] = useState(false);

  const handleCopyImage = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    try {
      await navigator.clipboard.writeText(src);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() || "generated-image.png";
    link.click();
  };

  return (
    <div
      className={cn(
        "group relative w-full max-w-75 overflow-hidden rounded-xl",
        className,
      )}
    >
      <Image
        src={src}
        width={300}
        height={300}
        className="w-full rounded-xl border border-gray-100 object-cover dark:border-gray-700"
        alt={alt}
      />
      {/* Hover Action Bar */}
      <div className="absolute inset-s-0 inset-e-0 bottom-0 flex translate-y-full items-center justify-between px-3 py-3 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                  aria-label="Edit image"
                >
                  <PencilIcon className="size-4" />
                </button>
              }
            />
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          {/* Regenerate Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                  aria-label="Regenerate image"
                >
                  <RegenerateIcon className="size-4" />
                </button>
              }
            />
            <TooltipContent>Regenerate</TooltipContent>
          </Tooltip>

          {/* Copy Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                  aria-label={
                    copiedImage ? "Copied image link" : "Copy image link"
                  }
                >
                  {copiedImage ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </button>
              }
            />
            <TooltipContent>{copiedImage ? "Copied!" : "Copy"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Download Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow backdrop-blur-sm transition hover:bg-white"
                aria-label="Download image"
              >
                <DownloadIcon className="size-4" />
              </button>
            }
          />
          <TooltipContent>Download</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
