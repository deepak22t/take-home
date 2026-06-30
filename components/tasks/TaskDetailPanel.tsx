import type { Task } from "@/lib/types/task";
import { TaskSummaryPanel } from "@/components/tasks/TaskSummaryPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
function formatDate(value: number): string {
  return new Date(value).toLocaleString();
}
export function TaskDetailPanel({ task }: { task: Task | null }) {
  const hasMetadata = Boolean(task && Object.keys(task.meta).length > 0);
  if (!task) {
    return (
      <aside className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Task Detail</h2>
          <p className="text-sm leading-6 text-slate-500">Select a task to inspect its state, live updates, normalization notes, metadata, and streamed summary.</p>
        </div>
      </aside>
    );
  }
  return (
    <aside className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <section>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Task Detail</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{task.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{task.id}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium capitalize text-slate-900">{task.type}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Assignee</dt>
            <dd className="font-medium text-slate-900">{task.assignee?.name ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Annotations</dt>
            <dd className="font-medium text-slate-900">{task.annotationCount}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Updated</dt>
            <dd className="font-medium text-slate-900">{formatDate(task.updatedAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Raw Type</dt>
            <dd className="font-medium text-slate-900">{task.rawType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Raw Status</dt>
            <dd className="font-medium text-slate-900">{task.rawStatus}</dd>
          </div>
        </dl>
      </section>
      {task.isPartial ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This task is currently partial because it entered the UI through the live feed before its full record was loaded.
        </div>
      ) : null}
      {task.warnings.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-900">Normalization Notes</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {task.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">Metadata</h3>
        {hasMetadata ? (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(task.meta, null, 2)}</pre>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
            No metadata provided by the backend for this task.
          </div>
        )}
      </section>
      <TaskSummaryPanel task={task} />
    </aside>
  );
}
