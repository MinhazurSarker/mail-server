"use client";

import { Button } from "@/components/ui/button";
import { PaperClipIcon } from "@/icons";
import { AttachButtonProps } from "./types";

export default function AttachButton({
  onClick,
  ariaLabel = "Attach file",
}: AttachButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={onClick}
      aria-label={ariaLabel}
      className="border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <PaperClipIcon className="size-5" />
    </Button>
  );
}
