import { createEntityAdapter, createSlice, type EntityState, type PayloadAction } from "@reduxjs/toolkit";
import { createPartialTask, normalizeAssignee, normalizeTaskStatus, normalizeUpdatedAt } from "@/lib/normalize";
import type { RawAssignee } from "@/lib/types/api";
import type { SortDirection, SortKey, Task, TaskStatus, TaskType } from "@/lib/types/task";
import { fetchAllTasksThunk, fetchTaskByIdThunk, fetchTasksPageThunk, hydrateTasksFromCache } from "@/store/tasks/tasksThunks";
const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (left, right) => right.updatedAt - left.updatedAt,
});
export type TasksState = EntityState<Task, string> & {
  currentPageIds: string[];
  liveTaskIds: string[];
  page: number;
  pageSize: number;
  total: number;
  loading: "idle" | "loading" | "refreshing" | "succeeded" | "failed";
  error: string | null;
  selectedTaskId: string | null;
  search: string;
  typeFilter: TaskType | "all";
  statusFilter: TaskStatus | "all";
  sortBy: SortKey;
  sortDirection: SortDirection;
  hydratedFromCache: boolean;
  cacheTimestamp: number | null;
  lastFreshAt: number | null;
};
const initialState: TasksState = tasksAdapter.getInitialState({
  currentPageIds: [],
  liveTaskIds: [],
  page: 1,
  pageSize: 20,
  total: 0,
  loading: "idle",
  error: null,
  selectedTaskId: null,
  search: "",
  typeFilter: "all",
  statusFilter: "all",
  sortBy: "updatedAt",
  sortDirection: "desc",
  hydratedFromCache: false,
  cacheTimestamp: null,
  lastFreshAt: null,
});
function rememberLiveTask(state: TasksState, taskId: string) {
  if (!state.currentPageIds.includes(taskId) && !state.liveTaskIds.includes(taskId)) {
    state.liveTaskIds.unshift(taskId);
    state.liveTaskIds = state.liveTaskIds.slice(0, 12);
  }
}
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setSelectedTaskId(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setTypeFilter(state, action: PayloadAction<TaskType | "all">) {
      state.typeFilter = action.payload;
      state.page = 1;
    },
    setStatusFilter(state, action: PayloadAction<TaskStatus | "all">) {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortKey; sortDirection: SortDirection }>) {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
      state.page = 1;
    },
    mergeTaskUpdatedEvent(state, action: PayloadAction<{ id: string; status?: unknown; updatedAt?: unknown }>) {
      const existing = state.entities[action.payload.id] ?? createPartialTask(action.payload.id);
      const warnings = [...existing.warnings];
      const nextStatus =
        action.payload.status !== undefined
          ? normalizeTaskStatus(action.payload.status, warnings)
          : { status: existing.status, rawStatus: existing.rawStatus };
      const nextUpdatedAt =
        action.payload.updatedAt !== undefined
          ? normalizeUpdatedAt(action.payload.updatedAt, warnings)
          : existing.updatedAt;
      tasksAdapter.upsertOne(state, {
        ...existing,
        status: nextStatus.status,
        rawStatus: nextStatus.rawStatus,
        updatedAt: nextUpdatedAt,
        warnings: Array.from(new Set(warnings)),
      });
      rememberLiveTask(state, action.payload.id);
    },
    mergeTaskAssignedEvent(state, action: PayloadAction<{ id: string; assignee?: RawAssignee }>) {
      const existing = state.entities[action.payload.id] ?? createPartialTask(action.payload.id);
      const warnings = [...existing.warnings];
      const assignee = normalizeAssignee(action.payload.assignee, warnings);
      tasksAdapter.upsertOne(state, {
        ...existing,
        assignee,
        warnings: Array.from(new Set(warnings)),
      });
      rememberLiveTask(state, action.payload.id);
    },
    mergeAnnotationCreatedEvent(state, action: PayloadAction<{ taskId: string; at?: unknown }>) {
      const existing = state.entities[action.payload.taskId] ?? createPartialTask(action.payload.taskId);
      const warnings = [...existing.warnings];
      const updatedAt = action.payload.at !== undefined ? normalizeUpdatedAt(action.payload.at, warnings) : Date.now();
      tasksAdapter.upsertOne(state, {
        ...existing,
        annotationCount: existing.annotationCount + 1,
        updatedAt,
        warnings: Array.from(new Set(warnings)),
      });
      rememberLiveTask(state, action.payload.taskId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateTasksFromCache.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        tasksAdapter.setAll(state, action.payload.items);
        state.currentPageIds = action.payload.items.map((task) => task.id);
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
        state.hydratedFromCache = true;
        state.cacheTimestamp = action.payload.cachedAt;
        state.loading = "refreshing";
      })
      .addCase(fetchTasksPageThunk.pending, (state) => {
        state.error = null;
        state.loading = state.hydratedFromCache ? "refreshing" : "loading";
      })
      .addCase(fetchAllTasksThunk.pending, (state) => {
        state.error = null;
        state.loading = state.hydratedFromCache ? "refreshing" : "loading";
      })
      .addCase(fetchAllTasksThunk.fulfilled, (state, action) => {
        tasksAdapter.setAll(state, action.payload.items.map((task) => ({ ...task, isPartial: false })));
        state.currentPageIds = action.payload.items.map((task) => task.id);
        state.liveTaskIds = [];
        state.total = action.payload.total;
        state.loading = "succeeded";
        state.lastFreshAt = Date.now();
        state.error = null;
      })
      .addCase(fetchAllTasksThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error = (action.payload as string) ?? action.error.message ?? "Unable to load tasks.";
      })
      .addCase(fetchTasksPageThunk.fulfilled, (state, action) => {
        tasksAdapter.upsertMany(state, action.payload.items.map((task) => ({ ...task, isPartial: false })));
        state.currentPageIds = action.payload.items.map((task) => task.id);
        state.liveTaskIds = state.liveTaskIds.filter((taskId) => !state.currentPageIds.includes(taskId));
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
        state.loading = "succeeded";
        state.lastFreshAt = Date.now();
        state.error = null;
      })
      .addCase(fetchTasksPageThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error = (action.payload as string) ?? action.error.message ?? "Unable to load tasks.";
      })
      .addCase(fetchTaskByIdThunk.fulfilled, (state, action) => {
        tasksAdapter.upsertOne(state, { ...action.payload, isPartial: false });
        state.liveTaskIds = state.liveTaskIds.filter((taskId) => taskId !== action.payload.id);
      });
  },
});
export const tasksActions = tasksSlice.actions;
export const tasksAdapterSelectors = tasksAdapter.getSelectors();
export default tasksSlice.reducer;
