"use client";

import Image from "next/image";
import { CalendarIcon, ChatBubbleIcon, CheckIcon, GripIcon } from "../icons";
import type { Task } from "./types";

export interface TaskItemProps extends Task {
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function TaskItem({
  id,
  title,
  isChecked,
  dueDate,
  commentCount,
  category,
  userAvatar,
  onDragStart,
  toggleChecked,
}: TaskItemProps) {
  return (
    <div
      id={`task-${id}`}
      draggable
      onDragStart={onDragStart}
      className="task mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-all dark:border-gray-800 dark:bg-white/5"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full items-start gap-4">
          <span className="cursor-grab text-gray-400 active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300">
            <GripIcon />
          </span>

          <label
            htmlFor={`taskCheckbox${id}`}
            className="w-full cursor-pointer select-none"
          >
            <div className="relative flex items-start">
              <input
                type="checkbox"
                id={`taskCheckbox${id}`}
                className="sr-only"
                checked={isChecked}
                onChange={toggleChecked}
              />
              <div
                className={`me-3 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  isChecked
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-300 bg-transparent dark:border-gray-700"
                }`}
              >
                {isChecked && <CheckIcon className="size-3.5" />}
              </div>
              <p
                className={`-mt-0.5 text-base transition-colors ${
                  isChecked
                    ? "text-gray-400 line-through dark:text-gray-500"
                    : "text-gray-800 dark:text-white/90"
                }`}
              >
                {title}
              </p>
            </div>
          </label>
        </div>

        <div className="flex w-full flex-col-reverse items-start justify-end gap-3 xl:flex-row xl:items-center xl:gap-5">
          {category && (
            <span className="inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
              {category}
            </span>
          )}

          <div className="flex w-full items-center justify-between gap-5 xl:w-auto xl:justify-normal">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="size-4" />
                {dueDate}
              </span>

              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <ChatBubbleIcon className="size-4" />
                {commentCount}
              </span>
            </div>

            <div className="size-6 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <Image width={24} height={24} src={userAvatar} alt="Assignee" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
