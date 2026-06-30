import localforage from "localforage";
import type { TaskListCache } from "@/lib/types/task";
const storage = localforage.createInstance({
  name: "annotation-activity-console",
  storeName: "task_cache",
});
const TASK_LIST_CACHE_KEY = "latest-task-list";
export async function loadTaskListCache(): Promise<TaskListCache | null> {
  const value = await storage.getItem<TaskListCache>(TASK_LIST_CACHE_KEY);
  return value ?? null;
}
export async function saveTaskListCache(cache: TaskListCache): Promise<void> {
  await storage.setItem(TASK_LIST_CACHE_KEY, cache);
}
