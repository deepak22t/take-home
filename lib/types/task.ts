export const KNOWN_TASK_TYPES = ["image", "audio", "text"] as const;
export const TASK_TYPES = [...KNOWN_TASK_TYPES, "unknown"] as const;
export type KnownTaskType = (typeof KNOWN_TASK_TYPES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export const TASK_STATUSES = ["todo", "in_progress", "qa", "done", "blocked", "unknown"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type SortKey = "updatedAt" | "annotationCount";
export type SortDirection = "asc" | "desc";
export type TaskAssignee = {
  id: string;
  name: string;
};
export type TaskBase = {
  id: string;
  title: string;
  status: TaskStatus;
  rawStatus: string;
  assignee: TaskAssignee | null;
  annotationCount: number;
  updatedAt: number;
  meta: Record<string, unknown>;
  rawType: string;
  isPartial: boolean;
  warnings: string[];
};
export type ImageTask = TaskBase & { type: "image" };
export type AudioTask = TaskBase & { type: "audio" };
export type TextTask = TaskBase & { type: "text" };
export type UnknownTask = TaskBase & { type: "unknown" };
export type Task = ImageTask | AudioTask | TextTask | UnknownTask;
export type TaskListCache = {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
  cachedAt: number;
};
export type SummaryStreamStatus = "idle" | "loading" | "streaming" | "success" | "error";
