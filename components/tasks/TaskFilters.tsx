"use client";
import { ChangeEvent } from "react";
import { TASK_STATUSES, TASK_TYPES, type SortDirection, type SortKey } from "@/lib/types/task";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTaskListMeta } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";
export function TaskFilters() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectTaskListMeta);
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDirection] = event.target.value.split(":") as [SortKey, SortDirection];
    dispatch(tasksActions.setSort({ sortBy, sortDirection }));
  };
  return (
    <div className="mb-5 grid gap-3 md:grid-cols-4">
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        Search
        <input
          value={meta.search}
          onChange={(event) => dispatch(tasksActions.setSearch(event.target.value))}
          placeholder="Search by title, id, or assignee"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        Type
        <select
          value={meta.typeFilter}
          onChange={(event) => dispatch(tasksActions.setTypeFilter(event.target.value as (typeof TASK_TYPES)[number] | "all"))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
        >
          <option value="all">all</option>
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        Status
        <select
          value={meta.statusFilter}
          onChange={(event) => dispatch(tasksActions.setStatusFilter(event.target.value as (typeof TASK_STATUSES)[number] | "all"))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
        >
          <option value="all">all</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm text-slate-700">
        Sort
        <select
          value={`${meta.sortBy}:${meta.sortDirection}`}
          onChange={handleSortChange}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
        >
          <option value="updatedAt:desc">updatedAt desc</option>
          <option value="updatedAt:asc">updatedAt asc</option>
          <option value="annotationCount:desc">annotationCount desc</option>
          <option value="annotationCount:asc">annotationCount asc</option>
        </select>
      </label>
    </div>
  );
}
