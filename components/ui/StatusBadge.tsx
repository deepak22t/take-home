import type { TaskStatus } from "@/lib/types/task";
const STATUS_STYLES: Record<TaskStatus | "all", string> = {
  all: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  todo: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  in_progress: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  qa: "bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  done: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  blocked: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200",
  unknown: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200",
};
export function StatusBadge({ status }: { status: TaskStatus | "all" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
