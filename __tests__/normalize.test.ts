import { normalizeTask, normalizeTaskListResponse } from "@/lib/normalize";
describe("normalizeTask", () => {
  it("normalizes mixed backend values into the internal model", () => {
    const task = normalizeTask({
      id: "t11",
      title: "Task 11",
      type: "video",
      status: "InProgress",
      assignee: null,
      annotationCount: "7",
      updatedAt: "2024-06-29T00:00:00.000Z",
      meta: { priority: "high" },
    });
    expect(task.type).toBe("unknown");
    expect(task.rawType).toBe("video");
    expect(task.status).toBe("in_progress");
    expect(task.annotationCount).toBe(7);
    expect(task.assignee).toBeNull();
    expect(task.meta).toEqual({ priority: "high" });
    expect(task.warnings).toContain("Unknown task type received: video.");
  });
  it("keeps list pagination metadata while normalizing each item", () => {
    const response = normalizeTaskListResponse({
      page: "2",
      pageSize: "20",
      total: 40,
      items: [
        {
          id: "t1",
          title: "Task 1",
          type: "image",
          status: "QA",
          annotationCount: 3,
          updatedAt: 1719600000000,
          assignee: { id: "u1", name: "Asha" },
          meta: {},
        },
      ],
    });
    expect(response.page).toBe(2);
    expect(response.pageSize).toBe(20);
    expect(response.total).toBe(40);
    expect(response.items[0].status).toBe("qa");
  });
  it("records a warning when meta is not an object", () => {
    const task = normalizeTask({
      id: "t9",
      title: "Task 9",
      type: "text",
      status: "done",
      annotationCount: 2,
      updatedAt: 1719600000000,
      meta: "rush",
    });

    expect(task.meta).toEqual({});
    expect(task.warnings).toContain("meta was invalid; defaulted to an empty object.");
  });
});
