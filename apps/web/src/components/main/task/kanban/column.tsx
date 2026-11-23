"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import { useRef } from "react";
import { useDrop } from "react-dnd";
import TaskItem from "./task-item";
import type { Task } from "./types";

export interface ColumnProps {
  title: string;
  tasks: Task[];
  status: string;
  moveTask: (dragIndex: number, hoverIndex: number, status: string) => void;
  changeTaskStatus: (taskId: string, newStatus: string) => void;
}

export default function Column({
  title,
  tasks,
  status,
  moveTask,
  changeTaskStatus,
}: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: () => ({ name: status }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drop(node);
        ref.current = node;
      }}
      className={cn(
        "swim-lane flex flex-col gap-5 border-e border-gray-200 p-4 transition-colors last-of-type:border-e-0 xl:p-6 dark:border-gray-800",
        isOver && "bg-blue-50/50 dark:bg-blue-500/10",
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-white/90">
          {title}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "todo"
                ? "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80"
                : status === "inProgress"
                  ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400"
                  : status === "completed"
                    ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-500"
                    : ""
            }`}
          >
            {tasks.length}
          </span>
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              />
            }
          >
            <HorizontalDotsIcon className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Clear All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-4">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            changeTaskStatus={changeTaskStatus}
          />
        ))}
      </div>
    </div>
  );
}
