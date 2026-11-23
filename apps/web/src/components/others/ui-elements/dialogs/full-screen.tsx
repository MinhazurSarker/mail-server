"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function FullScreenDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        Open Full Screen Dialog
      </DialogTrigger>
      <DialogContent fullScreen>
        <div className="flex min-h-full flex-col justify-between">
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">
                Modal Heading
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 text-sm leading-6 text-gray-500 sm:text-base dark:text-gray-400">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque euismod est quis mauris lacinia pharetra. Sed a
                ligula ac odio condimentum aliquet a nec nulla. Aliquam bibendum
                ex sit amet ipsum rutrum feugiat ultrices enim quam.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque euismod est quis mauris lacinia pharetra. Sed a
                ligula ac odio condimentum aliquet a nec nulla. Aliquam bibendum
                ex sit amet ipsum rutrum feugiat ultrices enim quam odio
                condimentum aliquet a nec nulla pellentesque euismod est quis
                mauris lacinia pharetra.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Pellentesque euismod est quis mauris lacinia pharetra.
              </p>
            </div>
          </div>
          <DialogFooter className="mx-0 mt-8 mb-0 justify-end p-0 sm:mt-12">
            <DialogClose render={<Button variant="outline" size="sm" />}>
              Close
            </DialogClose>
            <Button size="sm">Save Changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
