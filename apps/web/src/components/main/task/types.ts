export type TaskStatus = "todo" | "in-progress" | "inProgress" | "completed";

export interface TaskGroup {
  name: string;
  key: string;
  count: number;
}

export interface TaskFormData {
  title: string;
  dueDate: string;
  status: string;
  tag: string;
  assignee: string;
  priority: string;
  description: string;
}

export interface TaskCategory {
  name: string;
  color: string;
}
