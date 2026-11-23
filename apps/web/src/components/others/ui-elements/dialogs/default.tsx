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

export default function DefaultDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Heading</DialogTitle>
          <DialogDescription>
            This is a standard dialog window for displaying important
            information or confirming actions.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          euismod est quis mauris lacinia pharetra. Sed a ligula ac odio
          condimentum aliquet a nec nulla.
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Close
          </DialogClose>
          <Button size="sm">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
