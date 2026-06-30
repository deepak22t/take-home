import type { Task } from "@/lib/types/task";
import { TaskSummaryPanel } from "@/components/tasks/TaskSummaryPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
function formatDate(value: number): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function TaskDetailPanel({ task }: { task: Task | null }) {
  const hasMetadata = Boolean(task && Object.keys(task.meta).length > 0);
  if (!task) {
    return (
      <aside className="self-start rounded-[28px] border border-slate-200/80 bg-white p-0 shadow-sm shadow-slate-200/60 xl:sticky xl:top-6">
        <div className="px-5 py-5">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Task Details</p>
            <h2 className="mb-1.5 text-lg font-semibold text-slate-900">Task Overview</h2>
            <p className="text-sm leading-6 text-slate-500">Select a task to review its current state, source fields, metadata, and generated summary.</p>
          </div>
        </div>
      </aside>
    );
  }
  return (
    <aside className="self-start overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 xl:sticky xl:top-6">
      <section className="px-5 py-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div>
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Task Details</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{task.title}</h2>
            <p className="mt-0.5 text-xs font-medium tracking-[0.18em] text-slate-400">Task ID: {task.id}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
      </section>
      <div className="border-t border-slate-200 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="px-5 py-4 lg:border-r lg:border-slate-200">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Task Type</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatLabel(task.type)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Assignee</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{task.assignee?.name ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Annotation Count</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{task.annotationCount.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatDate(task.updatedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source Type</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatLabel(task.rawType)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Source Status</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{formatLabel(task.rawStatus)}</dd>
            </div>
          </dl>
          <section className="mt-4">
            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-slate-900">Task Metadata</h3>
            {hasMetadata ? (
              <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                {JSON.stringify(task.meta, null, 2)}
              </pre>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-500">
                No metadata is available for this task.
              </div>
            )}
          </section>
          {task.isPartial ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
              This task is currently partial because it entered the UI through the live feed before its full record was loaded.
            </div>
          ) : null}
          {task.warnings.length > 0 ? (
            <section className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-900">Data Notes</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {task.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="border-t border-slate-200 lg:border-t-0">
          <TaskSummaryPanel task={task} />
        </div>
      </div>
    </aside>
  );
}
