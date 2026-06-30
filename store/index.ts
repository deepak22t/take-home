import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "@/store/tasks/tasksSlice";
import summaryReducer from "@/store/summary/summarySlice";
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    summary: summaryReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
