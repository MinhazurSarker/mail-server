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
import { CheckCircleIcon } from "@/icons";
import { IconBg } from "./icons";

export default function SuccessDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        Open Success Dialog
      </DialogTrigger>
      <DialogContent className="text-center sm:max-w-md">
        <div className="relative mx-auto size-22.5">
          <IconBg fill="#F0FDF4" />
          <CheckCircleIcon className="absolute top-1/2 left-1/2 size-7.5 -translate-x-1/2 -translate-y-1/2 text-green-500" />
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center">Success!</DialogTitle>
          <DialogDescription className="text-center">
            Your transaction has been processed successfully. You can safely
            close this window.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose
            render={<Button size="sm" className="w-full sm:w-auto" />}
          >
            Okay, Got It
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
