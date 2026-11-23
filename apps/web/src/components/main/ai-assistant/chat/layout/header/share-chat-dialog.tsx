"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckIcon,
  CopyIcon,
  EnvelopeIcon,
  LinkedinIcon,
  TwitterXIcon,
  WhatsappIcon,
} from "@/icons";
import { useState } from "react";

const DEFAULT_SHARE_LINK =
  "https://tailadmin.com/ai-chat/f3d82a91-7c4ea84c31e672bf";

interface ShareChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl?: string;
}

export default function ShareChatDialog({
  open,
  onOpenChange,
  shareUrl = DEFAULT_SHARE_LINK,
}: ShareChatDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-130 p-6">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-semibold text-gray-800 dark:text-white/90">
            Share Chat
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Anyone with the link can view this conversation. New messages won’t
            be shared.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1">
          <div
            dir="ltr"
            className="flex h-11 w-full items-center overflow-hidden rounded-[10px] border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs select-all dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <span className="truncate">{shareUrl}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-3">
          <Button
            type="button"
            onClick={handleCopy}
            className="h-10 gap-2 rounded-[10px] bg-brand-500 px-4 text-white hover:bg-brand-600"
          >
            {copied ? (
              <CheckIcon className="size-5" />
            ) : (
              <CopyIcon className="size-5" />
            )}
            <span>{copied ? "Copied!" : "Copy link"}</span>
          </Button>

          <div className="hidden h-8 w-px bg-gray-200 sm:block dark:bg-gray-800" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Share to:
            </span>

            {/* Email */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={`mailto:?subject=AI%20Chat%20Conversation&body=${encodeURIComponent(shareUrl)}`}
                    className="inline-flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <EnvelopeIcon className="size-5" />
                  </a>
                }
              />
              <TooltipContent>Share via Email</TooltipContent>
            </Tooltip>

            {/* X / Twitter */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <TwitterXIcon className="size-4" />
                  </a>
                }
              />
              <TooltipContent>Share via X</TooltipContent>
            </Tooltip>

            {/* LinkedIn */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <LinkedinIcon className="size-5" />
                  </a>
                }
              />
              <TooltipContent>Share via LinkedIn</TooltipContent>
            </Tooltip>

            {/* WhatsApp */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-10 items-center justify-center rounded-[10px] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <WhatsappIcon className="size-5" />
                  </a>
                }
              />
              <TooltipContent>Share via WhatsApp</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
