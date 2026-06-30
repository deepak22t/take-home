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
export async function fetchAllTasks() {
  const firstPage = await fetchTasksPage({ page: 1, pageSize: 100 });
  const totalPages = Math.max(1, Math.ceil(firstPage.total / 100));
  if (totalPages === 1) {
    return firstPage;
  }
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchTasksPage({ page: index + 2, pageSize: 100 }))
  );
  return {
    page: 1,
    pageSize: firstPage.pageSize,
    total: firstPage.total,
    items: [firstPage, ...remainingPages].flatMap((page) => page.items),
  };
}
