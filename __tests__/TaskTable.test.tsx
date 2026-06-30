import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskTable } from "@/components/tasks/TaskTable";
import { useAppSelector } from "@/store/hooks";
import summaryReducer from "@/store/summary/summarySlice";
import tasksReducer, { type TasksState } from "@/store/tasks/tasksSlice";
import { selectVisibleTasks } from "@/store/tasks/tasksSelectors";
import type { Task } from "@/lib/types/task";
function ConnectedTable() {
  const tasks = useAppSelector(selectVisibleTasks);
  return (
    <div>
      <TaskFilters />
      <TaskTable tasks={tasks} />
    </div>
  );
}
describe("Task table filtering", () => {
  it("updates visible rows when the type filter changes", async () => {
    const t1 = {
      id: "t1",
      title: "Image task",
      type: "image",
      status: "todo",
      rawStatus: "todo",
      assignee: null,
      annotationCount: 1,
      updatedAt: 20,
      meta: {},
      rawType: "image",
      isPartial: false,
      warnings: [],
    } satisfies Task;

    const t2 = {
      id: "t2",
      title: "Audio task",
      type: "audio",
      status: "done",
      rawStatus: "done",
      assignee: { id: "u2", name: "Ben" },
      annotationCount: 4,
      updatedAt: 30,
      meta: {},
      rawType: "audio",
      isPartial: false,
      warnings: [],
    } satisfies Task;

    const tasksPreloadedState: TasksState = {
      ids: ["t1", "t2"],
      entities: {
        t1,
        t2,
      },
      currentPageIds: ["t1", "t2"],
      liveTaskIds: [],
      page: 1,
      pageSize: 20,
      total: 2,
      loading: "succeeded",
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
    };

    const store = configureStore({
      reducer: {
        tasks: tasksReducer,
        summary: summaryReducer,
      },
      preloadedState: {
        tasks: tasksPreloadedState,
        summary: {
          byTaskId: {},
        },
      },
    });
    render(
      <Provider store={store}>
        <ConnectedTable />
      </Provider>
    );
    expect(screen.getByText("Image task")).toBeInTheDocument();
    expect(screen.getByText("Audio task")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Type"), "audio");
    expect(screen.queryByText("Image task")).not.toBeInTheDocument();
    expect(screen.getByText("Audio task")).toBeInTheDocument();
  });
});
