"use client";
import { ChangeEvent } from "react";
import { TASK_STATUSES, TASK_TYPES, type SortDirection, type SortKey } from "@/lib/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";
function formatOptionLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function TaskFilters() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectTaskListMeta);
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDirection] = event.target.value.split(":") as [SortKey, SortDirection];
    dispatch(tasksActions.setSort({ sortBy, sortDirection }));
  };
  const selectClassName =
    "h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 sm:px-3.5 sm:py-3">
      <div className="grid items-start gap-2.5 md:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
          <span className="min-h-[16px] text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Search</span>
          <input
            value={meta.search}
            onChange={(event) => dispatch(tasksActions.setSearch(event.target.value))}
            placeholder="Search by title, id, or assignee"
            className="h-10 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
          <span className="min-h-[16px] text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Type</span>
          <div className="relative">
            <select
              value={meta.typeFilter}
              onChange={(event) => dispatch(tasksActions.setTypeFilter(event.target.value as (typeof TASK_TYPES)[number] | "all"))}
              className={selectClassName}
            >
              <option value="all">All Types</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatOptionLabel(type)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
                <path d="M4.25 6.25 8 10l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </span>
          </div>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
          <span className="min-h-[16px] text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span>
          <div className="relative">
            <select
              value={meta.statusFilter}
              onChange={(event) => dispatch(tasksActions.setStatusFilter(event.target.value as (typeof TASK_STATUSES)[number] | "all"))}
              className={selectClassName}
            >
              <option value="all">All Statuses</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatOptionLabel(status)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
                <path d="M4.25 6.25 8 10l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </span>
          </div>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
          <span className="min-h-[16px] text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sort</span>
          <div className="relative">
            <select
              value={`${meta.sortBy}:${meta.sortDirection}`}
              onChange={handleSortChange}
              className={selectClassName}
            >
              <option value="updatedAt:desc">Updated First</option>
              <option value="updatedAt:asc">Oldest First</option>
              <option value="annotationCount:desc">Most Annotations</option>
              <option value="annotationCount:asc">Fewest Annotations</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
                <path d="M4.25 6.25 8 10l3.75-3.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}
