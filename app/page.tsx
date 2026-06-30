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
  return (
    <main className="min-h-screen bg-slate-100/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Annotation Activity Console</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Typed task state, live feed updates, and safely rendered streamed summaries.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Feed: {feedStatus}</span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{freshnessLabel}</span>
            </div>
          </div>
        </header>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Task Queue</h2>
                <p className="text-sm text-slate-500">Search, filter, and inspect the current paginated task window.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
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
