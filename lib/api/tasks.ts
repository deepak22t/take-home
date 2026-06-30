import { normalizeTask, normalizeTaskListResponse } from "@/lib/normalize";
import { apiFetch } from "@/lib/api/client";
import type { RawTask, RawTaskListResponse } from "@/lib/types/api";
export async function fetchTasksPage(params: { page: number; pageSize: number }) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  const raw = await apiFetch<RawTaskListResponse>(`/api/tasks?${query.toString()}`);
  return normalizeTaskListResponse(raw);
}
export async function fetchTaskById(taskId: string) {
  const raw = await apiFetch<RawTask>(`/api/tasks/${taskId}`);
  return normalizeTask(raw);
}
