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
import { AddApiKeyDialogProps } from "./types";

export default function AddApiKeyDialog({
  isOpen,
  onOpenChange,
  onGenerate,
}: AddApiKeyDialogProps) {
  const [appName, setAppName] = React.useState("Saasbold");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;
    onGenerate(appName.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-6 lg:p-10">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Generate API key
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            To enable secure access to the web services, your app requires an
            API key with permissions for resources such as the S3 bucket.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="app-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your application name
            </Label>
            <Input
              id="app-name"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. My Application"
              className="h-11"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Naming your application makes it easier to recognize your API key in the future.
            </p>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              className="w-full bg-brand-500 text-white hover:bg-brand-600 sm:w-auto"
            >
              Generate Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
