"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useRef, useState } from "react";
import { CloseIcon, PlusIcon } from "./icons";
import type { TaskFormData } from "./types";

export interface TaskModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: TaskFormData) => void;
}

export default function TaskModal({
  isOpen,
  onClose,
  open,
  onOpenChange,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isControlled = open !== undefined || isOpen !== undefined;
  const isModalOpen = open ?? isOpen ?? false;

  const handleOpenChange = (openState: boolean) => {
    onOpenChange?.(openState);
    if (!openState) {
      onClose?.();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        title,
        dueDate,
        status: status || "todo",
        tag: tag || "Marketing",
        assignee: assignee || "Mayad Ahmed",
        priority: "High",
        description,
      });
    }
    closeButtonRef.current?.click();
    onClose?.();
    onOpenChange?.(false);
  };

  const modalContent = (
    <DialogContent
      showCloseButton={false}
      className="max-h-[90vh] max-w-175 overflow-hidden rounded-3xl border border-gray-200 bg-white p-0 shadow-theme-lg sm:max-w-175 dark:border-gray-800 dark:bg-[#1E2635]"
    >
      <ScrollArea scrollbars="vertical" className="max-h-[90vh]">
        <div className="relative p-6 sm:p-11">
          {/* Top-end close button matching Figma */}
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute inset-e-6 top-6 size-11 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <CloseIcon className="size-6" />
                <span className="sr-only">Close</span>
              </Button>
            }
          />

          {/* Hidden close button to trigger close on form submission */}
          <DialogClose ref={closeButtonRef} className="hidden" />

          {/* Title and subtitle */}
          <DialogHeader className="gap-2 pe-14 text-start">
            <DialogTitle className="text-2xl leading-8 font-semibold text-gray-800 dark:text-white/90">
              Add a new task
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 font-normal text-gray-500 dark:text-gray-400">
              Effortlessly manage your to-do list: add a new task
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              {/* Task Title */}
              <Field className="gap-1.5">
                <Label
                  htmlFor="task-title"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Task Title
                </Label>
                <Input
                  id="task-title"
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>

              {/* Due Date & Status */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <Field className="gap-1.5">
                  <Label
                    htmlFor="task-due-date"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Due Date
                  </Label>
                  <Input
                    id="task-due-date"
                    type="text"
                    placeholder="Select date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Field>

                <Field className="gap-1.5">
                  <Label
                    htmlFor="task-status"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Status
                  </Label>
                  <Input
                    id="task-status"
                    type="text"
                    placeholder="To Do"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                </Field>
              </div>

              {/* Tags & Assignees */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                <Field className="gap-1.5">
                  <Label
                    htmlFor="task-tags"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Tags
                  </Label>
                  <Input
                    id="task-tags"
                    type="text"
                    placeholder="Marketing"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                  />
                </Field>

                <Field className="gap-1.5">
                  <Label
                    htmlFor="task-assignees"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Assignees
                  </Label>
                  <Input
                    id="task-assignees"
                    type="text"
                    placeholder="Mayad Ahmed"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                </Field>
              </div>

              {/* Description */}
              <Field className="gap-1.5">
                <Label
                  htmlFor="task-description"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </Label>
                <Textarea
                  id="task-description"
                  placeholder=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-48.5 resize-none"
                />
              </Field>
            </div>

            {/* Attachments */}
            <div className="rounded-xl border border-gray-100 bg-[#f9fafb] p-5 dark:border-gray-800 dark:bg-gray-900/50">
              <input type="file" id="upload-file" className="sr-only" />
              <div className="mb-5 flex items-center gap-3">
                <span className="text-title-sm leading-7 font-medium text-gray-800 dark:text-white/90">
                  Attachments
                </span>
                <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <label
                  htmlFor="upload-file"
                  className="cursor-pointer text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Upload file
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 ps-3 pe-5 dark:border-gray-800 dark:bg-gray-900">
                  <div className="size-10 shrink-0">
                    <Image
                      width={40}
                      height={40}
                      src="/images/task/pdf.svg"
                      alt="PDF Icon"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Guidelines.pdf
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>PDF</span>
                      <span className="size-1 rounded-full bg-gray-400" />
                      <span>Download</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 ps-3 pe-5 dark:border-gray-800 dark:bg-gray-900">
                  <button
                    type="button"
                    aria-label="Remove Branding Assets"
                    className="absolute -inset-e-1.5 -top-2 flex size-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-xs hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white"
                  >
                    <CloseIcon className="size-3" />
                  </button>
                  <div className="size-10 shrink-0">
                    <Image
                      width={40}
                      height={40}
                      src="/images/task/google-drive.svg"
                      alt="Drive Icon"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Branding Assets
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>Media</span>
                      <span className="size-1 rounded-full bg-gray-400" />
                      <span>Download</span>
                    </div>
                  </div>
                </div>

                <label
                  htmlFor="upload-file"
                  className="flex size-15 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:border-brand-500 hover:text-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
                >
                  <PlusIcon className="size-7" />
                </label>
              </div>
            </div>

            {/* Avatar with Buttons */}
            <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-normal text-gray-700 dark:text-gray-400">
                  Viewers:
                </span>
                <AvatarGroup className="rtl:space-x-reverse">
                  <Avatar size="sm">
                    <AvatarImage
                      src="/images/user/user-13.jpg"
                      alt="Viewer 1"
                    />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarImage
                      src="/images/user/user-14.jpg"
                      alt="Viewer 2"
                    />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarImage
                      src="/images/user/user-15.jpg"
                      alt="Viewer 3"
                    />
                    <AvatarFallback>U3</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
              </div>

              <div className="flex w-full items-center gap-3 sm:w-auto">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  }
                />
                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Create Task
                </Button>
              </div>
            </div>
          </form>
        </div>
      </ScrollArea>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        {modalContent}
      </Dialog>
    );
  }

  return modalContent;
}
