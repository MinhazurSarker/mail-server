"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { Switch } from "@/components/ui/switch";
import { HorizontalDotsIcon } from "@/icons";
import * as React from "react";
import { SettingsIcon } from "./icons";
import IntegrationDeleteDialog from "./integration-delete-dialog";
import IntegrationDetailsDialog from "./integration-details-dialog";
import IntegrationSettingsDialog from "./integration-settings-dialog";
import { IntegrationCardProps } from "./types";

export default function IntegrationCard({
  integration,
  onToggleConnect,
  onDelete,
  onUpdateSettings,
}: IntegrationCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  return (
    <>
      <article className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="relative p-5 pb-9">
          <div className="mb-5 inline-flex size-10 items-center justify-center">
            {integration.icon}
          </div>
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">
            {integration.title}
          </h3>
          <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
            {integration.description}
          </p>
          <div className="absolute inset-e-5 top-5 h-fit">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Options for ${integration.title}`}
                  >
                    <HorizontalDotsIcon className="size-5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-40 p-2">
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  variant="destructive"
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 p-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="size-11 rounded-lg border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400"
              aria-label={`Settings for ${integration.title}`}
            >
              <SettingsIcon className="size-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(true)}
              className="h-11 rounded-lg border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400"
            >
              Details
            </Button>
          </div>

          <Switch
            checked={integration.connect}
            onCheckedChange={(checked) =>
              onToggleConnect?.(integration.id, checked)
            }
            aria-label={`Toggle ${integration.title} integration`}
          />
        </div>
      </article>

      <IntegrationDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        integration={integration}
      />

      <IntegrationSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        integration={integration}
        onSave={(settings) => onUpdateSettings?.(integration.id, settings)}
      />

      <IntegrationDeleteDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => onDelete?.(integration.id)}
      />
    </>
  );
}
