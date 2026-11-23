"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckIcon, CopyIcon, RegenerateIcon, TrashBinIcon } from "@/icons";
import * as React from "react";
import { ApiKeyRowProps } from "./types";

export default function ApiKeyRow({
  apiKey,
  onToggleStatus,
  onRegenerate,
  onDelete,
}: ApiKeyRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback or ignore
    }
  };

  const isEnabled = apiKey.status === "Active";

  return (
    <TableRow className="dark:border-gray-800">
      <TableCell className="py-4 ps-4 sm:ps-6">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {apiKey.name}
          </span>
          <div className="flex items-center gap-2">
            <InputGroup className="h-10 flex-1 sm:max-w-sm">
              <InputGroupInput
                value={apiKey.value}
                readOnly
                className="text-xs text-gray-700 dark:text-gray-300"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="xs"
                  onClick={handleCopy}
                  disabled={copied}
                  className="disabled:border-none disabled:bg-transparent"
                  aria-label={`Copy key for ${apiKey.name}`}
                >
                  {copied ? (
                    <>
                      <CheckIcon className="size-3.5 text-success-500" />
                      <span className="text-success-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <Button
              variant="outline"
              size="icon"
              onClick={() => onRegenerate?.(apiKey)}
              className="size-10 shrink-0 text-gray-600 dark:text-gray-400"
              aria-label="Regenerate API key"
            >
              <RegenerateIcon className="size-4" />
            </Button>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4 text-start align-bottom">
        <div className="flex h-10 items-center">
          <Badge
            variant="light"
            color={isEnabled ? "success" : "gray"}
            className="capitalize"
          >
            {apiKey.status}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4 text-start align-bottom text-sm text-gray-600 dark:text-gray-400">
        <div className="flex h-10 items-center">{apiKey.created}</div>
      </TableCell>

      <TableCell className="px-4 py-4 text-start align-bottom text-sm text-gray-600 dark:text-gray-400">
        <div className="flex h-10 items-center">{apiKey.lastUsed}</div>
      </TableCell>

      <TableCell className="px-4 py-4 text-start align-bottom">
        <div className="flex h-10 items-center">
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => onToggleStatus?.(apiKey.id, checked)}
            aria-label={`Toggle status for ${apiKey.name}`}
          />
        </div>
      </TableCell>

      <TableCell className="py-4 pe-4 text-center align-bottom sm:pe-6">
        <div className="flex h-10 items-center justify-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete?.(apiKey.id)}
            className="size-8 text-gray-500 hover:bg-red-500/10 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-500"
            aria-label={`Delete ${apiKey.name}`}
          >
            <TrashBinIcon className="size-5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
