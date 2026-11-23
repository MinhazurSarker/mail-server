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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import { IntegrationSettingsDialogProps } from "./types";

export default function IntegrationSettingsDialog({
  isOpen,
  onOpenChange,
  integration,
  onSave,
}: IntegrationSettingsDialogProps) {
  const [clientId, setClientId] = React.useState(
    integration.clientId ||
      "872364219810-abc123xyz456.apps.googleusercontent.com",
  );
  const [clientSecret, setClientSecret] = React.useState(
    integration.clientSecret || "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e",
  );
  const [authBaseUri, setAuthBaseUri] = React.useState(
    integration.authBaseUri || "https://accounts.application.com/o/oauth2/auth",
  );

  React.useEffect(() => {
    if (isOpen) {
      setClientId(
        integration.clientId ||
          "872364219810-abc123xyz456.apps.googleusercontent.com",
      );
      setClientSecret(
        integration.clientSecret || "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e",
      );
      setAuthBaseUri(
        integration.authBaseUri ||
          "https://accounts.application.com/o/oauth2/auth",
      );
    }
  }, [isOpen, integration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({ clientId, clientSecret, authBaseUri });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-139.5 p-6 lg:p-10">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-title-xs font-semibold text-gray-800 dark:text-white/90">
            Integration Settings
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Manage and configure your connected apps and services
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              App Name
            </Label>
            <Input
              type="text"
              value={integration.title}
              disabled
              className="cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Client ID
            </Label>
            <Input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Client Secret
            </Label>
            <Input
              type="text"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter client secret"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Authentication Base URI
            </Label>
            <Input
              type="text"
              value={authBaseUri}
              onChange={(e) => setAuthBaseUri(e.target.value)}
              placeholder="Enter authentication base URI"
            />
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Save your changes by clicking &apos;Save Changes&apos;
          </p>

          <DialogFooter className="mt-8 flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
