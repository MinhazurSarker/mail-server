"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowLeftRightIcon, ArrowRightIcon } from "@/icons";

export interface DetailsFooterProps {
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;
}

export default function DetailsFooter({
  onReply,
  onReplyAll,
  onForward,
}: DetailsFooterProps) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-gray-200 bg-white p-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 cursor-pointer"
        onClick={onReply}
      >
        <ArrowLeftIcon className="size-4 rtl:-scale-x-100" />
        Reply
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 cursor-pointer"
        onClick={onReplyAll}
      >
        <ArrowLeftRightIcon className="size-4" />
        Reply all
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 cursor-pointer"
        onClick={onForward}
      >
        <ArrowRightIcon className="size-4 rtl:-scale-x-100" />
        Forward
      </Button>
    </div>
  );
}
