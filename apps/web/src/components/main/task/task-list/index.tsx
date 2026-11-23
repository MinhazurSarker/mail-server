"use client";

import { useState } from "react";
import TaskHeader from "../task-header";
import TaskLane from "./task-lane";
import type { Task, TaskLaneType } from "./types";

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Finish user onboarding",
    isChecked: false,
    dueDate: "Tomorrow",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-01.jpg",
    status: "todo",
  },
  {
    id: "2",
    title: "Solve the Dribble prioritization issue with the team",
    isChecked: false,
    dueDate: "Tomorrow",
    commentCount: 2,
    category: "Marketing",
    userAvatar: "/images/user/user-02.jpg",
    status: "todo",
  },
  {
    id: "3",
    title: "Finish user onboarding",
    isChecked: true,
    dueDate: "Feb 12, 2024",
    commentCount: 1,
    category: "Marketing",
    userAvatar: "/images/user/user-03.jpg",
    status: "todo",
  },
  {
    id: "4",
    title: "Work in Progress (WIP) Dashboard",
    isChecked: false,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    category: "Template",
    userAvatar: "/images/user/user-04.jpg",
    status: "in-progress",
  },
  {
    id: "5",
    title: "Product Update - Q4 2024",
    isChecked: false,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    category: "Template",
    userAvatar: "/images/user/user-05.jpg",
    status: "in-progress",
  },
  {
    id: "6",
    title: "Kanban Flow Manager",
    isChecked: true,
    dueDate: "Jan 8, 2027",
    commentCount: 2,
    category: "Template",
    userAvatar: "/images/user/user-06.jpg",
    status: "in-progress",
  },
];

const LANES: TaskLaneType[] = ["todo", "in-progress", "completed"];

export interface TaskListProps {
  initialTasks?: Task[];
}

export default function TaskList({
  initialTasks = INITIAL_TASKS,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragStart = (
    _e: React.DragEvent<HTMLDivElement>,
    taskId: string,
  ) => {
    setDragging(taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    if (dragging === null) return;

    const updatedTasks = tasks.map((task) =>
      task.id === dragging ? { ...task, status } : task,
    );

    const statusTasks = updatedTasks.filter((task) => task.status === status);
    const otherTasks = updatedTasks.filter((task) => task.status !== status);

    const dropY = e.clientY;
    const droppedIndex = statusTasks.findIndex((task) => {
      const taskElement = document.getElementById(`task-${task.id}`);
      if (!taskElement) return false;
      const rect = taskElement.getBoundingClientRect();
      const taskMiddleY = rect.top + rect.height / 2;
      return dropY < taskMiddleY;
    });

    if (droppedIndex !== -1) {
      const draggedTask = statusTasks.find((task) => task.id === dragging);
      if (draggedTask) {
        statusTasks.splice(statusTasks.indexOf(draggedTask), 1);
        statusTasks.splice(droppedIndex, 0, draggedTask);
      }
    }

    setTasks([...otherTasks, ...statusTasks]);
    setDragging(null);
  };

  const toggleChecked = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isChecked: !task.isChecked } : task,
      ),
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <TaskHeader />

      <div className="space-y-8 border-t border-gray-200 p-4 xl:p-6 dark:border-gray-800">
        {LANES.map((lane) => (
          <TaskLane
            key={lane}
            lane={lane}
            tasks={tasks.filter((task) => task.status === lane)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, lane)}
            onDragStart={handleDragStart}
            onToggleChecked={toggleChecked}
          />
        ))}
      </div>
    </div>
  );
}
