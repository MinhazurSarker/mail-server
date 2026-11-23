"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertIcon } from "@/icons";
import { IconBg } from "./icons";

export default function DestructiveDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete Account
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-start gap-4">
          <div className="relative size-12 shrink-0">
            <IconBg fill="#FEF2F2" className="size-12" />
            <AlertIcon className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-red-500" />
          </div>
          <div className="space-y-1 pe-8">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account? This action cannot
                be undone and will permanently remove all your data from our
                servers.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" size="sm">
            Yes, Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
