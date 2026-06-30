import type { TaskStatus } from "@/lib/types/task";
const STATUS_STYLES: Record<TaskStatus | "all", string> = {
  all: "text-slate-500",
  todo: "text-slate-500",
  in_progress: "text-amber-600",
  qa: "text-indigo-600",
  done: "text-emerald-600",
  blocked: "text-rose-600",
  unknown: "text-zinc-500",
};
export function StatusBadge({ status }: { status: TaskStatus | "all" }) {
  return (
    <span className={`inline-flex text-[11px] font-semibold uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
