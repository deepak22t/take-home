import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SummaryStreamStatus } from "@/lib/types/task";
export type SummaryEntry = {
  content: string;
  status: SummaryStreamStatus;
  error: string | null;
  updatedAt: number | null;
};
export type SummaryState = {
  byTaskId: Record<string, SummaryEntry>;
};
const initialState: SummaryState = {
  byTaskId: {},
};
function getEntry(state: SummaryState, taskId: string): SummaryEntry {
  if (!state.byTaskId[taskId]) {
    state.byTaskId[taskId] = {
      content: "",
      status: "idle",
      error: null,
      updatedAt: null,
    };
  }
  return state.byTaskId[taskId];
}
const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    summaryRequested(state, action: PayloadAction<string>) {
      const entry = getEntry(state, action.payload);
      entry.content = "";
      entry.status = "loading";
      entry.error = null;
      entry.updatedAt = Date.now();
    },
    summaryChunkReceived(state, action: PayloadAction<{ taskId: string; chunk: string }>) {
      const entry = getEntry(state, action.payload.taskId);
      entry.content += action.payload.chunk;
      entry.status = "streaming";
      entry.updatedAt = Date.now();
    },
    summaryCompleted(state, action: PayloadAction<string>) {
      const entry = getEntry(state, action.payload);
      entry.status = "success";
      entry.updatedAt = Date.now();
    },
    summaryFailed(state, action: PayloadAction<{ taskId: string; error: string }>) {
      const entry = getEntry(state, action.payload.taskId);
      entry.status = "error";
      entry.error = action.payload.error;
      entry.updatedAt = Date.now();
    },
    summaryCancelled(state, action: PayloadAction<string>) {
      const entry = getEntry(state, action.payload);
      if (entry.status === "loading" || entry.status === "streaming") {
        entry.status = entry.content ? "success" : "idle";
        entry.updatedAt = Date.now();
      }
    },
  },
});
export const summaryActions = summarySlice.actions;
export default summarySlice.reducer;
