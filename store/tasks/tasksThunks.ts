import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTaskById, fetchTasksPage } from "@/lib/api/tasks";
import { loadTaskListCache, saveTaskListCache } from "@/lib/storage/taskCache";
import type { RootState } from "@/store";
export const hydrateTasksFromCache = createAsyncThunk("tasks/hydrateTasksFromCache", async () => {
  return loadTaskListCache();
});
export const fetchTasksPageThunk = createAsyncThunk(
  "tasks/fetchTasksPage",
  async (params: { page: number; pageSize: number }, { rejectWithValue }) => {
    try {
      const result = await fetchTasksPage(params);
      await saveTaskListCache({
        items: result.items,
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        cachedAt: Date.now(),
      });
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to load tasks.");
    }
  }
);
export const fetchTaskByIdThunk = createAsyncThunk(
  "tasks/fetchTaskById",
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await fetchTaskById(taskId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to load task.");
    }
  },
  {
    condition: (taskId, { getState }) => {
      const state = getState() as RootState;
      const task = state.tasks.entities[taskId];
      return !task || task.isPartial;
    },
  }
);
