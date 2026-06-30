import { selectFilteredTasksTotal, selectVisibleTasks } from "@/store/tasks/tasksSelectors";
import type { RootState } from "@/store";
const state = {
  tasks: {
    ids: ["t1", "t2", "t3", "t11"],
    entities: {
      t1: {
        id: "t1",
        title: "Alpha image",
        type: "image",
        status: "todo",
        rawStatus: "todo",
        assignee: { id: "u1", name: "Asha" },
        annotationCount: 1,
        updatedAt: 10,
        meta: {},
        rawType: "image",
        isPartial: false,
        warnings: [],
      },
      t2: {
        id: "t2",
        title: "Bravo audio",
        type: "audio",
        status: "done",
        rawStatus: "done",
        assignee: null,
        annotationCount: 8,
        updatedAt: 30,
        meta: {},
        rawType: "audio",
        isPartial: false,
        warnings: [],
      },
      t3: {
        id: "t3",
        title: "Charlie text",
        type: "text",
        status: "done",
        rawStatus: "done",
        assignee: { id: "u3", name: "Chen" },
        annotationCount: 2,
        updatedAt: 20,
        meta: {},
        rawType: "text",
        isPartial: false,
        warnings: [],
      },
      t11: {
        id: "t11",
        title: "Delta image",
        type: "image",
        status: "done",
        rawStatus: "done",
        assignee: { id: "u4", name: "Diya" },
        annotationCount: 9,
        updatedAt: 40,
        meta: {},
        rawType: "image",
        isPartial: false,
        warnings: [],
      },
    },
    currentPageIds: ["t1", "t2", "t3"],
    liveTaskIds: [],
    page: 1,
    pageSize: 1,
    total: 4,
    loading: "succeeded",
    error: null,
    selectedTaskId: null,
    search: "",
    typeFilter: "image",
    statusFilter: "all",
    sortBy: "updatedAt",
    sortDirection: "desc",
    hydratedFromCache: false,
    cacheTimestamp: null,
    lastFreshAt: null,
  },
  summary: {
    byTaskId: {},
  },
} as unknown as RootState;
describe("selectVisibleTasks", () => {
  it("filters across the full loaded dataset before paginating", () => {
    const tasks = selectVisibleTasks(state);
    expect(tasks.map((task) => task.id)).toEqual(["t11"]);
    expect(selectFilteredTasksTotal(state)).toBe(2);
  });
});
