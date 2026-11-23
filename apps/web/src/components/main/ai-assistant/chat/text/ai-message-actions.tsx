"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckIcon,
  CopyIcon,
  DislikeIcon,
  LikeIcon,
  RegenerateIcon,
} from "@/icons";
import { cn } from "@/utils";
import { useState } from "react";
import { AiMessageActionsProps } from "./types";

export default function AiMessageActions({
  contentToCopy,
  onRegenerate,
  className,
}: AiMessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    if (!liked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked((prev) => !prev);
    if (!disliked) setLiked(false);
  };

  return (
    <div className={cn("relative mt-3 inline-flex items-center", className)}>
      {/* Copy Button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleCopy}
              className="text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/90"
              aria-label={copied ? "Copied text" : "Copy text"}
            >
              {copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          }
        />
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>

      {/* Like Button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleLike}
              className="hover:bg-gray-100 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-label="Like response"
            >
              <LikeIcon
                className={cn(
                  "size-4 transition-colors duration-200 dark:group-hover/button:text-white/90",
                  liked
                    ? "text-brand-500"
                    : "text-gray-800 dark:text-gray-400",
                )}
              />
            </Button>
          }
        />
        <TooltipContent>Like</TooltipContent>
      </Tooltip>

      {/* Dislike Button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleDislike}
              className="hover:bg-gray-100 dark:border-white/5 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-label="Dislike response"
            >
              <DislikeIcon
                className={cn(
                  "size-4 transition-colors duration-200 dark:group-hover/button:text-white/90",
                  disliked
                    ? "text-brand-500"
                    : "text-gray-800 dark:text-gray-400",
                )}
              />
            </Button>
          }
        />
        <TooltipContent>Dislike</TooltipContent>
      </Tooltip>

      {/* Regenerate Button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onRegenerate}
              className="text-gray-800 hover:bg-gray-100 hover:text-gray-900 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white/90"
              aria-label="Regenerate response"
            >
              <RegenerateIcon className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Regenerate</TooltipContent>
      </Tooltip>
    </div>
  );
}
