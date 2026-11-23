"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntegrationDetailsDialogProps } from "./types";

export default function IntegrationDetailsDialog({
  isOpen,
  onOpenChange,
  integration,
}: IntegrationDetailsDialogProps) {
  const {
    title,
    appName = `${title} App`,
    clientId = "N/A",
    clientSecret = "N/A",
    authBaseUri = "N/A",
  } = integration;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-139.5 p-6 lg:p-10">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-title-xs font-semibold text-gray-800 dark:text-white/90">
            {title} Details
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Check the credentials and settings for your connected app.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          <li className="flex justify-between py-2.5">
            <span className="w-1/2 text-sm text-gray-500 dark:text-gray-400">
              App Name
            </span>
            <span className="w-1/2 text-sm font-medium wrap-break-word text-gray-700 dark:text-gray-300">
              {appName}
            </span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="w-1/2 text-sm text-gray-500 dark:text-gray-400">
              Client ID
            </span>
            <span className="w-1/2 text-sm font-medium wrap-break-word text-gray-700 dark:text-gray-300">
              {clientId}
            </span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="w-1/2 text-sm text-gray-500 dark:text-gray-400">
              Client Secret
            </span>
            <span className="w-1/2 text-sm font-medium wrap-break-word text-gray-700 dark:text-gray-300">
              {clientSecret}
            </span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="w-1/2 text-sm text-gray-500 dark:text-gray-400">
              Authentication base URI
            </span>
            <span className="w-1/2 text-sm font-medium wrap-break-word text-gray-700 dark:text-gray-300">
              {authBaseUri}
            </span>
          </li>
        </ul>

        <DialogFooter className="mt-8 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
