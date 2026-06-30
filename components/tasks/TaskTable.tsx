"use client";
import type { Task } from "@/lib/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedTaskId, selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";
import { StatusBadge } from "@/components/ui/StatusBadge";
function formatRelativeTime(updatedAt: number): string {
  const deltaMs = Date.now() - updatedAt;
  if (!Number.isFinite(deltaMs)) {
    return "unknown";
  }

  const isFuture = deltaMs < 0;
  const absSeconds = Math.max(0, Math.floor(Math.abs(deltaMs) / 1000));

  if (absSeconds < 60) {
    return isFuture ? `in ${absSeconds}s` : `${absSeconds}s ago`;
  }

  const absMinutes = Math.floor(absSeconds / 60);
  if (absMinutes < 60) {
    return isFuture ? `in ${absMinutes}m` : `${absMinutes}m ago`;
  }

  const absHours = Math.floor(absMinutes / 60);
  if (absHours < 24) {
    return isFuture ? `in ${absHours}h` : `${absHours}h ago`;
  }

  const absDays = Math.floor(absHours / 24);
  if (absDays < 30) {
    return isFuture ? `in ${absDays}d` : `${absDays}d ago`;
  }

  return new Date(updatedAt).toISOString().slice(0, 10);
}
export function TaskTable({ tasks }: { tasks: Task[] }) {
  const dispatch = useAppDispatch();
  const selectedTaskId = useAppSelector(selectSelectedTaskId);
  const meta = useAppSelector(selectTaskListMeta);
  const showInitialLoading = meta.loading === "loading" && tasks.length === 0;
  const showBlockingError = Boolean(meta.error) && tasks.length === 0;
  const showInlineError = Boolean(meta.error) && tasks.length > 0;
  if (showInitialLoading) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">Loading tasks...</div>;
  }
  if (showBlockingError) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Failed to load tasks: {meta.error}</div>;
  }
  if (tasks.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">No tasks match the current filters.</div>;
  }
  return (
    <div className="space-y-4">
      {showInlineError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Refresh failed: {meta.error}. Showing the most recent task data that is already in memory.
        </div>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/90 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Annotations</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tasks.map((task) => {
              const isSelected = task.id === selectedTaskId;
              return (
                <tr
                  key={task.id}
                  onClick={() => dispatch(tasksActions.setSelectedTaskId(task.id))}
                  className={`cursor-pointer transition hover:bg-slate-50 ${isSelected ? "bg-blue-50/70 shadow-[inset_3px_0_0_0_rgb(59,130,246)]" : ""}`}
                >
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium text-slate-950">{task.title}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{task.id}</div>
                    {task.isPartial ? (
                      <div className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                        Live-only partial task
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top capitalize text-slate-700">{task.type}</td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-4 align-top text-slate-700">{task.assignee?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-4 align-top font-medium text-slate-900">{task.annotationCount}</td>
                  <td className="px-4 py-4 align-top text-slate-600">{formatRelativeTime(task.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
