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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import { AddIntegrationDialogProps } from "./types";

const APP_OPTIONS = [
  "Google Meet",
  "Mailchimp",
  "Zoom",
  "Loom",
  "Gmail",
  "Linear",
  "Trello",
  "Notion",
  "Jira",
];

export default function AddIntegrationDialog({
  isOpen,
  onOpenChange,
  onAdd,
}: AddIntegrationDialogProps) {
  const [app, setApp] = React.useState(APP_OPTIONS[0]);
  const [clientId, setClientId] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState("");
  const [authBaseUri, setAuthBaseUri] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      app,
      clientId: clientId || "client-id-" + Date.now(),
      clientSecret: clientSecret || "secret-" + Date.now(),
      authBaseUri:
        authBaseUri || "https://accounts.application.com/o/oauth2/auth",
    });
    setClientId("");
    setClientSecret("");
    setAuthBaseUri("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-139.5 p-6 lg:p-10">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-title-xs font-semibold text-gray-800 dark:text-white/90">
            New Integration
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Set up an integration and add a brief explanation for the team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Select App</FieldLabel>
            <Select value={app} onValueChange={(val) => setApp(val ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select App" />
              </SelectTrigger>
              <SelectContent className="max-h-50">
                {APP_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Client ID</FieldLabel>
            <Input
              type="text"
              placeholder="Enter client ID here"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Client Secret</FieldLabel>
            <Input
              type="text"
              placeholder="Enter client secret here"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Authentication Base URI</FieldLabel>
            <Input
              type="text"
              placeholder="Paste URL here"
              value={authBaseUri}
              onChange={(e) => setAuthBaseUri(e.target.value)}
            />
            <FieldDescription>
              Paste the full URI, and we&apos;ll automatically pull out and show
              only the subdomain for quick reference.
            </FieldDescription>
          </Field>

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
              Add Integration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
