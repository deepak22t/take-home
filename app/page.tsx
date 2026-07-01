"use client";
import { useEffect, useMemo, useState } from "react";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskPagination } from "@/components/tasks/TaskPagination";
import { TaskTable } from "@/components/tasks/TaskTable";
import { useTaskFeed } from "@/hooks/useTaskFeed";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSelectedTask, selectTaskListMeta, selectVisibleTasks } from "@/store/tasks/tasksSelectors";
import { tasksActions } from "@/store/tasks/tasksSlice";
import { fetchTaskByIdThunk, fetchTasksPageThunk, hydrateTasksFromCache } from "@/store/tasks/tasksThunks";
function formatTimestamp(value: number | null): string {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleTimeString();
}
export default function Page() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectVisibleTasks);
  const selectedTask = useAppSelector(selectSelectedTask);
  const meta = useAppSelector(selectTaskListMeta);
  const feedStatus = useTaskFeed();
  const [hasHydratedCache, setHasHydratedCache] = useState(false);
  useEffect(() => {
    void dispatch(hydrateTasksFromCache()).finally(() => {
      setHasHydratedCache(true);
    });
  }, [dispatch]);
  useEffect(() => {
    if (!hasHydratedCache) {
      return;
    }
    void dispatch(fetchTasksPageThunk({ page: meta.page, pageSize: meta.pageSize }));
  }, [dispatch, hasHydratedCache, meta.page, meta.pageSize]);
  useEffect(() => {
    if (!selectedTask && tasks.length > 0) {
      dispatch(tasksActions.setSelectedTaskId(tasks[0].id));
      return;
    }
    if (selectedTask?.isPartial) {
      void dispatch(fetchTaskByIdThunk(selectedTask.id));
    }
  }, [dispatch, selectedTask, tasks]);
  const freshnessLabel = useMemo(() => {
    if (meta.loading === "refreshing" && meta.hydratedFromCache) {
      return `Showing cached data from ${formatTimestamp(meta.cacheTimestamp)} while refreshing.`;
    }
    if (meta.hydratedFromCache && !meta.lastFreshAt) {
      return `Showing cached data from ${formatTimestamp(meta.cacheTimestamp)}.`;
    }
    if (meta.lastFreshAt) {
      return `Fresh data loaded at ${formatTimestamp(meta.lastFreshAt)}.`;
    }
    return "No data loaded yet.";
  }, [meta.cacheTimestamp, meta.hydratedFromCache, meta.lastFreshAt, meta.loading]);
  const feedStatusClass = useMemo(() => {
    if (feedStatus === "open") {
      return "text-emerald-700";
    }
    if (feedStatus === "connecting" || feedStatus === "reconnecting") {
      return "text-amber-700";
    }
    if (feedStatus === "error") {
      return "text-rose-700";
    }
    return "text-slate-600";
  }, [feedStatus]);
  const freshnessClass = useMemo(() => {
    if (meta.loading === "refreshing" && meta.hydratedFromCache) {
      return "text-amber-700";
    }
    if (meta.lastFreshAt) {
      return "text-blue-700";
    }
    return "text-slate-600";
  }, [meta.hydratedFromCache, meta.lastFreshAt, meta.loading]);
  return (
    <main className="min-h-screen bg-slate-100/80 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-7">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Operations Console</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">Annotation Activity Console</h1>
              <p className="mt-2.5 text-sm leading-6 text-slate-600">
                Monitor task activity, review updates, and inspect generated summaries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700">
                Feed: <span className={`ml-1 capitalize ${feedStatusClass}`}>{feedStatus}</span>
              </span>
              <span className={`inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium ${freshnessClass}`}>
                {freshnessLabel}
              </span>
            </div>
          </div>
        </header>
        <div className="grid gap-5">
          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Task Overview</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Active Queue</h2>
                <p className="text-sm leading-6 text-slate-500">Review the current task set, apply filters, and monitor recent updates.</p>
              </div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                Server total: {meta.total}
              </div>
            </div>
            <TaskFilters />
            <TaskTable tasks={tasks} />
            <TaskPagination />
          </section>
          <TaskDetailPanel task={selectedTask} />
        </div>
      </div>
    </main>
  );
}
