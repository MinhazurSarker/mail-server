"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { HorizontalDotsIcon } from "@/icons";
import TaskItem from "./task-item";
import type { Task } from "./types";

export interface TaskLaneProps {
  lane: string;
  tasks: Task[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onToggleChecked?: (taskId: string) => void;
}

export default function TaskLane({
  lane,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onToggleChecked,
}: TaskLaneProps) {
  return (
    <div onDragOver={onDragOver} onDrop={onDrop} className="swim-lane">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-base font-medium text-gray-800 capitalize dark:text-white/90">
          {lane}
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              lane === "todo"
                ? "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80"
                : lane === "in-progress"
                  ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400"
                  : lane === "completed"
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

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            {...task}
            toggleChecked={() =>
              onToggleChecked
                ? onToggleChecked(task.id)
                : task.toggleChecked?.()
            }
            onDragStart={(e) => onDragStart(e, task.id)}
          />
        ))}
      </div>
    </div>
  );
}
