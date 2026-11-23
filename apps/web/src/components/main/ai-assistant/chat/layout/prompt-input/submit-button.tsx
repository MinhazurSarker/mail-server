"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpIcon, MicrophoneIcon } from "@/icons";
import { SubmitButtonProps } from "./types";

export default function SubmitButton({ isSend, onClick }: SubmitButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      onClick={onClick}
      className="size-9 cursor-pointer rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
      aria-label={isSend ? "Send prompt" : "Record voice prompt"}
    >
      {isSend ? (
        <ArrowUpIcon className="size-5" />
      ) : (
        <MicrophoneIcon className="size-5" />
      )}
    </Button>
  );
}
