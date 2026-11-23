"use client";

import { cn } from "@/utils";
import Image from "next/image";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { CalendarIcon, ChatBubbleIcon, LinkIcon } from "../icons";
import type { DropResult, Task } from "./types";

export interface TaskItemProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number, status: string) => void;
  changeTaskStatus: (taskId: string, newStatus: string) => void;
}

const getCategoryStyles = (color: string) => {
  switch (color) {
    case "error":
      return "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400";
    case "success":
      return "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400";
    case "brand":
      return "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400";
    case "orange":
      return "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    case "purple":
      return "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400";
  }
};

export default function TaskItem({
  task,
  index,
  moveTask,
  changeTaskStatus,
}: TaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    Task & { index: number },
    DropResult,
    { handlerId: string | symbol | null }
  >({
    accept: "task",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop: () => ({ name: task.status }),
    hover(item, monitor) {
      if (!ref.current) return;
      if (item.status !== task.status) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveTask(dragIndex, hoverIndex, task.status);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag<
    Task,
    DropResult,
    { isDragging: boolean }
  >({
    type: "task",
    item: () => ({ ...task, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.name !== item.status) {
        changeTaskStatus(item.id, dropResult.name);
      }
    },
  });

  const opacity = isDragging ? 0.3 : 1;

  return (
    <div
      ref={(node) => {
        drag(drop(node));
        ref.current = node;
      }}
      style={{ opacity }}
      className="task relative rounded-xl border border-gray-200 bg-white p-5 shadow-theme-sm transition-opacity dark:border-gray-800 dark:bg-white/5"
      data-handler-id={handlerId}
    >
      <div className="space-y-4">
        <div>
          <h4 className="me-10 mb-5 text-base font-medium text-gray-800 dark:text-white/90">
            {task.title}
          </h4>
          {task.projectDesc && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {task.projectDesc}
            </p>
          )}
          {task.projectImg && (
            <div className="my-4">
              <Image
                width={279}
                height={140}
                src={task.projectImg}
                alt={task.title}
                className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="size-4" />
              {task.dueDate}
            </span>
            {task.comments !== undefined && (
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <ChatBubbleIcon className="size-4" />
                {task.comments}
              </span>
            )}
            {task.links !== undefined && (
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <LinkIcon className="size-4" />
                {task.links}
              </span>
            )}
          </div>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              getCategoryStyles(task.category.color),
            )}
          >
            {task.category.name}
          </span>
        </div>
      </div>
      <div className="absolute inset-e-5 top-5 size-6 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
        <Image width={24} height={24} src={task.assignee} alt="Assignee" />
      </div>
    </div>
  );
}
