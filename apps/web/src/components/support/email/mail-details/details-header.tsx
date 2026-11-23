"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  InfoIcon,
  TrashBinIcon,
  EyeIcon,
} from "@/icons";
import type { DetailsHeaderProps } from "./types";

export default function DetailsHeader({
  onBack,
  onDelete,
  onMarkUnread,
  onArchive,
  onViewRawEml,
  spfResult,
  dkimResult,
  dmarcResult,
}: DetailsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {onBack && (
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Back to inbox"
            onClick={onBack}
            className="cursor-pointer"
          >
            <ArrowLeftIcon className="size-4 rtl:rotate-180" />
          </Button>
        )}

        <ButtonGroup>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={onDelete}
            aria-label="Delete message"
            className="cursor-pointer text-red-500 hover:text-red-600"
          >
            <TrashBinIcon className="size-4" />
          </Button>

          <Button
            size="icon-sm"
            variant="outline"
            onClick={onArchive}
            aria-label="Archive message"
            className="cursor-pointer"
          >
            <ArchiveIcon className="size-4" />
          </Button>
        </ButtonGroup>

        <Button
          size="icon-sm"
          variant="outline"
          onClick={onMarkUnread}
          aria-label="Mark unread"
          className="cursor-pointer"
        >
          <EnvelopeIcon className="size-4" />
        </Button>

        {onViewRawEml && (
          <Button
            size="sm"
            variant="outline"
            onClick={onViewRawEml}
            className="hidden sm:inline-flex gap-1.5 text-xs text-gray-600 dark:text-gray-300"
          >
            <EyeIcon className="size-3.5" />
            Raw EML
          </Button>
        )}
      </div>

      {/* Security Verification Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {spfResult && (
          <Badge
            variant="light"
            color={spfResult.toLowerCase().includes("pass") ? "success" : "warning"}
            size="sm"
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            SPF {spfResult}
          </Badge>
        )}
        {dkimResult && (
          <Badge
            variant="light"
            color={dkimResult.toLowerCase().includes("pass") ? "success" : "warning"}
            size="sm"
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            DKIM {dkimResult}
          </Badge>
        )}
        {dmarcResult && (
          <Badge
            variant="light"
            color={dmarcResult.toLowerCase().includes("pass") ? "success" : "warning"}
            size="sm"
            className="text-[10px] uppercase font-mono tracking-wider"
          >
            DMARC {dmarcResult}
          </Badge>
        )}
      </div>
    </div>
  );
}
