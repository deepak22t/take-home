"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFilteredTasksTotal, selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";
export function TaskPagination() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectTaskListMeta);
  const filteredTotal = useAppSelector(selectFilteredTasksTotal);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / meta.pageSize));
  const rangeStart = filteredTotal === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const rangeEnd = Math.min(filteredTotal, meta.page * meta.pageSize);
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-700">Page {meta.page} of {totalPages}</span>
        <span className="text-slate-500">
          Showing {rangeStart}-{rangeEnd} of {filteredTotal}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm font-medium text-slate-600">Page size</span>
          <select
            value={meta.pageSize}
            onChange={(event) => dispatch(tasksActions.setPageSize(Number(event.target.value)))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-900 outline-none focus:border-slate-900"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => dispatch(tasksActions.setPage(Math.max(1, meta.page - 1)))}
          disabled={meta.page <= 1}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => dispatch(tasksActions.setPage(Math.min(totalPages, meta.page + 1)))}
          disabled={meta.page >= totalPages}
          className="rounded-xl bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
