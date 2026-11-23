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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function DialogWithForm() {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        Open Form Dialog
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl p-6 sm:max-w-146 sm:p-10">
        <DialogHeader>
          <DialogTitle className="text-title-sm font-medium text-gray-800 dark:text-white/90">
            Personal Information
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <FieldGroup className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <Field className="gap-1.5">
                <FieldLabel>First Name</FieldLabel>
                <Input placeholder="Jhon" />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel>Last Name</FieldLabel>
                <Input placeholder="Doe" />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <Field className="gap-1.5">
                <FieldLabel>Email Address</FieldLabel>
                <Input type="email" placeholder="jhondoe@tailadmin.com" />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel>Phone</FieldLabel>
                <Input type="tel" placeholder="+09 363 398 46" />
              </Field>
            </div>
            <Field className="gap-1.5">
              <FieldLabel>Bio</FieldLabel>
              <Input placeholder="Team Manager" />
            </Field>
          </FieldGroup>
          <DialogFooter className="mx-0 mb-0 gap-3 p-0 pt-2 sm:justify-end">
            <DialogClose render={<Button variant="outline">Close</Button>} />
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
