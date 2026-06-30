import { createSelector } from "@reduxjs/toolkit";
import type { Task } from "@/lib/types/task";
import type { RootState } from "@/store";
import { tasksAdapterSelectors } from "@/store/tasks/tasksSlice";
const selectTasksState = (state: RootState) => state.tasks;
const adapterSelectors = tasksAdapterSelectors;
export const selectTaskEntities = createSelector(selectTasksState, adapterSelectors.selectEntities);
export const selectSelectedTaskId = (state: RootState) => state.tasks.selectedTaskId;
export const selectTaskListMeta = createSelector(selectTasksState, (tasks) => ({
  loading: tasks.loading,
  error: tasks.error,
  page: tasks.page,
  pageSize: tasks.pageSize,
  total: tasks.total,
  hydratedFromCache: tasks.hydratedFromCache,
  cacheTimestamp: tasks.cacheTimestamp,
  lastFreshAt: tasks.lastFreshAt,
  sortBy: tasks.sortBy,
  sortDirection: tasks.sortDirection,
  typeFilter: tasks.typeFilter,
  statusFilter: tasks.statusFilter,
  search: tasks.search,
}));
export const selectCurrentPageTasks = createSelector(
  [selectTasksState, selectTaskEntities],
  (tasksState, entities) => {
    return tasksState.currentPageIds.map((id) => entities[id]).filter(Boolean) as Task[];
  }
);
export const selectVisibleTasks = createSelector([selectCurrentPageTasks, selectTasksState], (tasks, tasksState) => {
  const normalizedSearch = tasksState.search.trim().toLowerCase();
  const filtered = tasks.filter((task) => {
    const matchesType = tasksState.typeFilter === "all" || task.type === tasksState.typeFilter;
    const matchesStatus = tasksState.statusFilter === "all" || task.status === tasksState.statusFilter;
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.id.toLowerCase().includes(normalizedSearch) ||
      task.assignee?.name.toLowerCase().includes(normalizedSearch);
    return matchesType && matchesStatus && Boolean(matchesSearch);
  });
  filtered.sort((left, right) => {
    const direction = tasksState.sortDirection === "asc" ? 1 : -1;
    const leftValue = tasksState.sortBy === "updatedAt" ? left.updatedAt : left.annotationCount;
    const rightValue = tasksState.sortBy === "updatedAt" ? right.updatedAt : right.annotationCount;
    if (leftValue === rightValue) {
      return left.title.localeCompare(right.title);
    }
    return leftValue > rightValue ? direction : -direction;
  });
  return filtered;
});
export const selectSelectedTask = createSelector(
  [selectTaskEntities, selectSelectedTaskId],
  (entities, selectedTaskId) => (selectedTaskId ? entities[selectedTaskId] ?? null : null)
);
