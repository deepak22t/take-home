import type { RawAssignee, RawTask, RawTaskListResponse } from "@/lib/types/api";
import type { Task, TaskAssignee, TaskStatus, TaskType } from "@/lib/types/task";
const STATUS_MAP: Record<string, TaskStatus> = {
  todo: "todo",
  in_progress: "in_progress",
  inprogress: "in_progress",
  done: "done",
  qa: "qa",
  blocked: "blocked",
};
function asRecord(value: unknown, warnings?: string[], field?: string): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (value !== undefined && value !== null && warnings && field) {
    warnings.push(`${field} was invalid; defaulted to an empty object.`);
  }
  return {};
}
function normalizeString(value: unknown, fallback: string, warnings: string[], field: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  warnings.push(`${field} was missing or invalid.`);
  return fallback;
}
export function normalizeTaskType(value: unknown, warnings: string[]): { type: TaskType; rawType: string } {
  const rawType = typeof value === "string" && value.trim() ? value.trim() : "unknown";
  if (rawType === "image" || rawType === "audio" || rawType === "text") {
    return { type: rawType, rawType };
  }
  warnings.push(`Unknown task type received: ${rawType}.`);
  return { type: "unknown", rawType };
}
export function normalizeTaskStatus(value: unknown, warnings: string[]): { status: TaskStatus; rawStatus: string } {
  const rawStatus = typeof value === "string" && value.trim() ? value.trim() : "unknown";
  const normalized = STATUS_MAP[rawStatus.replace(/[^a-z]/gi, "").toLowerCase()] ?? STATUS_MAP[rawStatus.toLowerCase()] ?? "unknown";
  if (normalized === "unknown") {
    warnings.push(`Unknown task status received: ${rawStatus}.`);
  }
  return { status: normalized, rawStatus };
}
export function normalizeAssignee(value: RawAssignee, warnings: string[]): TaskAssignee | null {
  if (value == null) {
    return null;
  }
  const record = asRecord(value);
  const id = typeof record.id === "string" && record.id.trim() ? record.id.trim() : null;
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : null;
  if (!id || !name) {
    warnings.push("Assignee payload was invalid and has been cleared.");
    return null;
  }
  return { id, name };
}
export function normalizeAnnotationCount(value: unknown, warnings: string[]): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  warnings.push("annotationCount was invalid; defaulted to 0.");
  return 0;
}
export function normalizeUpdatedAt(value: unknown, warnings: string[]): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  warnings.push("updatedAt was invalid; defaulted to current time.");
  return Date.now();
}
export function normalizeTask(raw: RawTask): Task {
  const warnings: string[] = [];
  const { type, rawType } = normalizeTaskType(raw.type, warnings);
  const { status, rawStatus } = normalizeTaskStatus(raw.status, warnings);
  return {
    id: normalizeString(raw.id, `unknown-${Math.random().toString(36).slice(2, 10)}`, warnings, "id"),
    title: normalizeString(raw.title, "Untitled task", warnings, "title"),
    type,
    status,
    rawStatus,
    assignee: normalizeAssignee(raw.assignee, warnings),
    annotationCount: normalizeAnnotationCount(raw.annotationCount, warnings),
    updatedAt: normalizeUpdatedAt(raw.updatedAt, warnings),
    meta: asRecord(raw.meta, warnings, "meta"),
    rawType,
    isPartial: false,
    warnings,
  };
}
export function createPartialTask(taskId: string, partial: Partial<Task> = {}): Task {
  const warnings = partial.warnings ? [...partial.warnings] : ["Task exists only from the live event stream."];
  return {
    id: taskId,
    title: partial.title ?? `Unloaded task ${taskId}`,
    type: partial.type ?? "unknown",
    status: partial.status ?? "unknown",
    rawStatus: partial.rawStatus ?? "unknown",
    assignee: partial.assignee ?? null,
    annotationCount: partial.annotationCount ?? 0,
    updatedAt: partial.updatedAt ?? Date.now(),
    meta: partial.meta ?? {},
    rawType: partial.rawType ?? "unknown",
    isPartial: true,
    warnings,
  } as Task;
}
function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}
export function normalizeTaskListResponse(raw: RawTaskListResponse) {
  const items = Array.isArray(raw.items) ? raw.items.map((item) => normalizeTask(item as RawTask)) : [];
  return {
    page: Math.max(1, toNumber(raw.page, 1)),
    pageSize: Math.max(1, toNumber(raw.pageSize, 20)),
    total: Math.max(0, toNumber(raw.total, items.length)),
    items,
  };
}
