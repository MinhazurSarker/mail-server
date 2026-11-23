"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { FilterIcon, PlusIcon } from "./icons";
import TaskModal from "./task-modal";
import type { TaskFormData, TaskGroup } from "./types";

const DEFAULT_TASK_GROUPS: TaskGroup[] = [
  { name: "All Tasks", key: "All", count: 14 },
  { name: "To do", key: "Todo", count: 3 },
  { name: "In Progress", key: "InProgress", count: 4 },
  { name: "Completed", key: "Completed", count: 4 },
];

export interface TaskHeaderProps {
  taskGroups?: TaskGroup[];
  selectedGroup?: string;
  onSelectGroup?: (groupKey: string) => void;
  onAddTask?: (taskData: TaskFormData) => void;
}

export default function TaskHeader({
  taskGroups = DEFAULT_TASK_GROUPS,
  selectedGroup: controlledGroup,
  onSelectGroup,
  onAddTask,
}: TaskHeaderProps) {
  const [internalSelectedGroup, setInternalSelectedGroup] = useState("All");

  const activeGroup = controlledGroup ?? internalSelectedGroup;

  const handleSelectGroup = (key: string) => {
    if (onSelectGroup) {
      onSelectGroup(key);
    } else {
      setInternalSelectedGroup(key);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-5 xl:px-6 xl:py-6">
      <div className="flex w-full flex-col gap-5 sm:justify-between xl:flex-row xl:items-center">
        <div className="grid grid-cols-2 items-center gap-x-1 gap-y-2 rounded-lg bg-gray-100 p-0.5 sm:grid-cols-4 dark:bg-gray-900">
          {taskGroups.map((group) => {
            const isSelected = activeGroup === group.key;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => handleSelectGroup(group.key)}
                className={`group inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-white ${
                  isSelected
                    ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {group.name}
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs leading-normal font-medium transition-colors group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400 ${
                    isSelected
                      ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                      : "bg-white dark:bg-white/5"
                  }`}
                >
                  {group.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <Button variant="outline" size="sm">
            <FilterIcon />
            Filter & Sort
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button size="sm">
                  Add New Task
                  <PlusIcon />
                </Button>
              }
            />
            <TaskModal onSubmit={onAddTask} />
          </Dialog>
        </div>
      </div>
    </div>
  );
}
